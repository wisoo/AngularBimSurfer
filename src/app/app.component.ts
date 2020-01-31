import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { BimServerViewer } from '@slivka/surfer/viewer/bimserverviewer';
import { ProjectInfo } from './project-info.model';
import { environment } from 'src/environments/environment';
import { BimMeasureUnitHelper } from './bim-measure-unit.helper';
import { BimMeasureType } from './bim-measure-type.enum';
import { BimMeasureRow } from './bim-measure-row';
import { MatTableDataSource } from '@angular/material/table';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BimPropertyListService } from './bim-property-list.service';
import { BimPropertyNodeModel, BimPropertyModel } from './bim-property.model';
import {Subject, Observable, of as observableOf, Subscription} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { IFCObject } from './classes/ifcObjectEntity';
import {DataService} from './bim-property-list/ifcObject-data.service';
import {LayersSelectorComponent} from './layers-selector/layers-selector.component';
import {LayerService} from './layers-selector/layer.service';
import {CredentialsService} from './login/credentials-service';
import {BimServerClientService} from './bim-server-client.service';
import {stringify} from 'querystring';

export interface Direction {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  allLayers: any[];
  activeLayers: any[] = [];
  oldActiveLayers: any[];
  layerSubscription: Subscription;
  layerOidsMap: Map<string, Array<Number>>;
  layerOidsMaplayerSubscription: Subscription;
  credentials: {email: string, pwd: string};
  credentialsSubscription: Subscription;
  env = environment;
  title = 'bim-surfer';
  documentId = '';
  projectsInfo: ProjectInfo[] = [];
  projectSubscription: Subscription;
  bimServerClient: BimServerClient;
  public bimServerViewer: BimServerViewer;
  camera: any;
  progress = 0;
  isSectionDirection: boolean;
  roid: number;
  div: HTMLElement;

  dataSource: MatTableDataSource<BimMeasureRow>;
  displayedColumns: string[] = ['name', 'value', 'measureUnit'];

  properties: MatTreeFlatDataSource<BimPropertyModel, BimPropertyNodeModel>;
  treeControl: FlatTreeControl<BimPropertyNodeModel>;
  treeFlattener: MatTreeFlattener<BimPropertyModel, BimPropertyNodeModel>;

  private unsubscribe: Subject<void> = new Subject();

  directions: Direction[] = [
      { value: '0', viewValue: 'No section' },
      { value: '1', viewValue: 'Free section' },
      { value: '2', viewValue: 'X-axis' },
      { value: '3', viewValue: 'Y-axis' },
      { value: '4', viewValue: 'Z-axis' }
  ];

  translations = {};
  private animationEnabled: boolean;

  constructor(
    private credentialsService: CredentialsService,
    private bimPropertyListService: DataService,
    private layersSelectorService: LayerService,
    private bimMeasureUnitHelper: BimMeasureUnitHelper,
    private http: HttpClient) {
    this.animationEnabled = true;
    this.isSectionDirection = true;

    // subscribe to home component messages
    this.layerSubscription = this.layersSelectorService.getActiveLayers().subscribe(layers => {
      if (layers) {
        this.activeLayers = layers;
        if (typeof this.allLayers === 'undefined') {
          this.allLayers = layers;
        }
        if (typeof this.oldActiveLayers === 'undefined') {
          this.oldActiveLayers = layers;
        }
        this.updateLayersInCanvas();
      } else {
        // clear activeLayers when empty message received
        this.activeLayers = [];
      }
    });
    this.layerOidsMaplayerSubscription = this.layersSelectorService.getLayerOidsMap().subscribe(layerOidsMap => {
      if (layerOidsMap) {
        this.layerOidsMap = layerOidsMap;
      } else {
        this.layerOidsMap = new Map();
      }
    });
    this.projectSubscription = this.credentialsService.getProjects().subscribe(projects => {
      if (projects) {
        console.log('got projects from credentialsService');
        this.projectsInfo = projects;
      } else {
        // clear messages when empty message received
        this.projectsInfo = [];
      }
    });
  }

  ngAfterViewInit() {
    this.translations['BOUNDING_BOX_SIZE_ALONG_X'] = 'BOUNDING_BOX_SIZE_ALONG_X';
    this.translations['BOUNDING_BOX_SIZE_ALONG_Y'] = 'BOUNDING_BOX_SIZE_ALONG_Y';
    this.translations['BOUNDING_BOX_SIZE_ALONG_Z'] = 'BOUNDING_BOX_SIZE_ALONG_Z';

    this.translations['SURFACE_AREA_ALONG_X'] = 'SURFACE_AREA_ALONG_X';
    this.translations['SURFACE_AREA_ALONG_Y'] = 'SURFACE_AREA_ALONG_Y';
    this.translations['SURFACE_AREA_ALONG_Z'] = 'SURFACE_AREA_ALONG_Z';
    this.translations['LARGEST_FACE_AREA'] = 'LARGEST_FACE_AREA';
    this.translations['TOTAL_SURFACE_AREA'] = 'TOTAL_SURFACE_AREA';

    this.translations['TOTAL_SHAPE_VOLUME'] = 'TOTAL_SHAPE_VOLUME';
  }

  inCanvasClick(event) {
    if (this.bimServerViewer.viewer.selectedElements.size) {
      console.log('selected elements right now: ', this.bimServerViewer.viewer.selectedElements._set);
      this.bimPropertyListService.getObject(this.bimServerViewer.viewer.selectedElements._set.values().next().value);
    }
  }

  keyPressListener(event) {
    if (event.key === ' ') {
      event.preventDefault();
      this.animationEnabled = !(this.animationEnabled);
      this.bimServerViewer.viewer.navigationActive = this.animationEnabled;
    }
  }

  onLoadDocument(event: any) {
      this.loadModel(this.documentId);
  }


  navigateToProject(info: ProjectInfo) {
    console.log('clicked on button ', info);
    this.bimServerClient = BimServerClientService.getInstance();
    this.loadModel(info.name);
  }

  private loadModel(documentName: string) {
    this.dataSource = undefined;
    this.getProjectByName(documentName, (project: any) => {
      this.getTotalPrimitives([project.roid]).then((totalPrimitives: number) => {
        this.loadProject(project.oid, totalPrimitives + 10000);
      });
    });
  }

  private getTotalPrimitives(roids: any): any {
    return new Promise((resolve, reject) => {
      this.bimServerClient.call('ServiceInterface', 'getNrPrimitivesTotal', { roids: roids }, (totalPrimitives: any) => {
        resolve(totalPrimitives);
      });
    });
  }

  private getProjectByName(documentName: string, callback: any) {
    this.bimServerClient.call('ServiceInterface', 'getProjectsByName', { name: documentName }, (projects: any) => {
      callback({ oid: projects[0].oid, roid: projects[0].lastRevisionId });
    }, (error: any) => this.errorCallBack(error));
  }

  getObjectsStates(address, phase) {
    const params = new HttpParams().set('Phase', phase);
    return( this.http.get(address + '?Phase=PH_000024', { responseType: 'text' }) );
  }

  onDirectionChange(event: any) {
      this.bimServerViewer.settings.sectionPlaneDirection = Number(event.value);

      if (this.bimServerViewer.settings.sectionPlaneDirection === 0) {
          this.bimServerViewer.viewer.removeSectionPlaneWidget();
          this.bimServerViewer.viewer.disableSectionPlane();
      } else if (this.bimServerViewer.settings.sectionPlaneDirection === 1) {
          this.bimServerViewer.viewer.removeSectionPlaneWidget();
      }
  }

  private setDataSource(data: BimPropertyModel[]) {
      this.properties.data = (data) ? data : [];
      if (data && data.length === 1) {
          this.treeControl.expandAll();
      } else {
          this.treeControl.collapseAll();
      }
  }



  private clear() {
      this.dataSource = undefined;

      if (this.bimServerViewer) {
          const nodes = this.bimServerViewer.viewer.overlay.nodes;
          for (let index = 0; index < nodes.length; index++) {
              nodes[index].destroy();
          }
          this.bimServerViewer.viewer.eventHandler.off('selection_state_changed', (elements: any, isSelected: boolean) => {
              this.onSelectionChanged(elements, isSelected);
          });
      }
  }

  private errorCallBack(error: any) {
      console.error(error);
  }



  private loadProject(poid: number, totalPrimitives: number) {
      this.bimServerClient.call('ServiceInterface', 'getProjectByPoid', {
          poid: poid
      }, (project: any) => {
          this.bimServerClient.getModel(project.oid, project.lastRevisionId, project.schema, false, (model: any) => {
              const canvas = document.getElementById('glcanvas');

              this.roid = project.lastRevisionId;
              this.loadUnits(model);
              this.bimServerViewer = new BimServerViewer(
                  {
                      triangleThresholdDefaultLayer: totalPrimitives,
                      excludedTypes: this.getExludeTypes(project.schema)
                  },
                  canvas);
              this.bimServerViewer.viewer.addAnimationListener((deltaTime) => {
                if (this.animationEnabled) {
                  this.bimServerViewer.viewer.camera.orbitYaw(0.05);
                }
              });
              this.bimServerViewer.setProgressListener((percentage: number) => {
                  this.progress = Math.round(percentage);
                if (percentage === 100) {
                  this.getObjectsStates('https://app.flashbim.com/JJPP.php', 'PH_000024').subscribe(data => {
                    console.log(data);
                    this.div = document.createElement('div', );
                    this.div.innerHTML = data.trim();
                    const ids = this.setColorsAccordingToDB();
                  });
                }
              });
              this.layersSelectorService.getLayers();
              this.layersSelectorService.sendLayerOidsMap();

              this.bimServerViewer.loadModel(this.bimServerClient, project).then((data: any) => {
                  const bimSurfer = this.bimServerViewer.viewer;
                  bimSurfer.eventHandler.on('selection_state_changed', (elements: any, isSelected: boolean) => {
                      this.onSelectionChanged(elements, isSelected);
                  });

              });
          });
      });
  }
  /*

   */
  private onSelectionChanged(elements: number[], isSelected: boolean) {
      if (elements && elements.length > 0 && isSelected) {
          this.bimPropertyListService.getObject(elements[0]);
          this.getGeometryInfo(elements[0]);

      } else {
          this.dataSource = undefined;
      }
  }

  private getExludeTypes(schema: string): string[] {
      if (schema === 'ifc4') {
        // return [];
        // return ['IfcSpace', 'IfcOpeningElement', 'IfcOpeningStandardCase'];
        // return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation', 'IfcOpeningStandardCase'];
        return [/*'IfcSpace',*/ 'IfcOpeningElement', 'IfcOpeningStandardCase'];
      } else {
        // return [];
        // return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation'];
        return ['IfcSpace', 'IfcOpeningElement'];
      }
  }

  private getGeometryInfo(oid: number) {
      this.bimServerClient.call('ServiceInterface', 'getGeometryInfo', { roid: this.roid, oid: oid }, (data: any) => {
          this.loadMeasurement(data.additionalData);
      }, (error: any) => this.errorCallBack(error));
  }

  private loadMeasurement(data: string) {
      const ret: BimMeasureRow[] = [];
      JSON.parse(data, (key, value) => {
          const type = this.getType(key);
          if (type) {
              ret.push({ key: key, name: this.translations[key], value: Number(value).toFixed(4), type: type });
          }
      });

      ret.sort((n1, n2) => n1.key.localeCompare(n2.key));

      this.dataSource = new MatTableDataSource<BimMeasureRow>(ret);
  }

  private getType(key: string): BimMeasureType {
      if (key.indexOf('AREA') > -1) {
          return BimMeasureType.ifcAreaMeasure;
      } else if (key.indexOf('BOUNDING') > -1) {
          return BimMeasureType.ifcLength;
      } else if (key.indexOf('VOLUME') > -1) {
          return BimMeasureType.ifcVolumeMeasure;
      }
      return undefined;
  }

  private loadUnits(model: any) {
      model.query(this.getUnitsQuery(), () => { }).done(() => {
          this.bimMeasureUnitHelper.loadUnits(model);
      });
  }

  getMeasureUnit(type: BimMeasureType): string {
      return this.bimMeasureUnitHelper.getUnitSymbol(type);
  }

  private getUnitsQuery() {
      return {
          types: [
              {
                  name: 'IfcUnitAssignment',
              },
              {
                  name: 'IfcSIUnit',
              },
              {
                  name: 'IfcConversionBasedUnit',
              }
          ]
      };
  }

  private updateLayersInCanvas() {
    for (const layer of this.allLayers) {
      if (this.activeLayers.includes(layer) && this.oldActiveLayers.includes(layer)
        || !(this.activeLayers.includes(layer)) && !(this.oldActiveLayers.includes(layer))) {
      } else {
        if (this.activeLayers.includes(layer) && !this.oldActiveLayers.includes(layer)) {
          console.log('now hiding ', layer.name);
          this.toggleLayer(layer, true);
        } else {
          console.log('now showing ', layer.name);
          this.toggleLayer(layer, false);
        }
      }
    }
    this.oldActiveLayers = this.activeLayers;
  }

  private toggleLayer(layer, show) {
    const stringOidsSet = new Set();
    for (const oid of this.layerOidsMap.get(layer.name)) {
      stringOidsSet.add(oid.toString());
    }
    this.bimServerViewer.viewer.setVisibility(stringOidsSet, show);
  }

  public setColorsAccordingToDB() {
    const oidToGuid = new Map();
    const guidToOid = new Map();
    const databaseIDsAndState = new Map();
    const node = this.div;
    console.log('node = ', node);
    const fabrication = new Map();
    const fabrique = new Map();
    const palettise = new Map();
    const livre = new Map();
    const pose = new Map();
    const feraille = new Map();
    const coule = new Map();

    const colors = {
      Fabrication: [1, 0.85, 0, 100],
      Fabriquer: [1, 1, 0, 100],
      Palettiser: [0.68, 0.47, 0, 100],
      Livrer: [0.53, 0, 0, 100],
      Poser: [100, 200, 100, 100],
      Ferrailler: [200, 100, 0, 100],
      Couler: [0, 100, 200, 100]
    };

     return this.bimServerClient.call(
      'LowLevelInterface',
      'getDataObjectsByType',
      {
        roid: this.bimServerViewer.revisionId,
        packageName: 'ifc2x3tc1',
        className: 'IfcBuildingElementProxy', flat: 'false'
      },
      (res) => {
        for (const elem of res) {
          console.log(elem);
          for (const value of elem.values) {
            if (value.fieldName === 'Tag') {
              guidToOid.set(value.stringValue, elem.oid);
              oidToGuid.set(elem.oid, value.stringValue);
            }
          }
        }

        for (let i = 0; i < node.childNodes[0].childNodes.length; i++) {
          const child = node.childNodes[0].childNodes[i];
          if (child['name'] !== '') {
            databaseIDsAndState.set(child['name'], child['value']);
          } else {
            console.log('childWithNoName: ', child);
          }
        }
        console.log('databaseIDsAndState = ', databaseIDsAndState);
        for (const numero of databaseIDsAndState.keys()) {
          const numArray = [numero];
          console.log('setting color of numero, ', numero, colors[databaseIDsAndState.get(numero)]);
          console.log('this.bimServerViewer.viewer.setColor(', numArray, ', ', colors[databaseIDsAndState.get(numero)], ');');
          this.bimServerViewer.viewer.setColor(numArray, colors[databaseIDsAndState.get(numero)]);
        }
        console.log('result: ', [oidToGuid, guidToOid]);
        return [oidToGuid, guidToOid];
      },
      error => { console.log(error); return []; }
    );
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.layerSubscription.unsubscribe();
    this.credentialsSubscription.unsubscribe();
    this.layerOidsMaplayerSubscription.unsubscribe();
    this.projectSubscription.unsubscribe();
  }
}
