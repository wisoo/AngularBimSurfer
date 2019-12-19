import { Component, AfterViewInit } from '@angular/core';
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
import { Subject, Observable, of as observableOf } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { IFCObject } from './classes/ifcObjectEntity';

export interface Direction {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    env = environment;
    title = 'bim-surfer';
    documentId = '';
    projectsInfo: ProjectInfo[] = [];
    bimServerClient: BimServerClient;
    bimServerViewer: BimServerViewer;
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
        private bimPropertyListService: BimPropertyListService,
        private bimMeasureUnitHelper: BimMeasureUnitHelper,
        private http: HttpClient) {
        console.log('this is the constructor console.log working');
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<BimPropertyNodeModel>(this.getLevel, this.isExpandable);
        this.properties = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.animationEnabled = true;
        this.isSectionDirection = true;
    }

    transformer = (node: BimPropertyModel, level: number) => {
        return new BimPropertyNodeModel(!!node.children, node.name, level, node.value);
    }

    hasChild = (_: number, _nodeData: BimPropertyNodeModel) => _nodeData.expandable;

    private getChildren = (node: BimPropertyModel): Observable<BimPropertyModel[]> => observableOf(node.children);

    private getLevel = (node: BimPropertyNodeModel) => node.level;

    private isExpandable = (node: BimPropertyNodeModel) => node.expandable;

    ngAfterViewInit() {
        this.login();
        this.translations['BOUNDING_BOX_SIZE_ALONG_X'] = 'BOUNDING_BOX_SIZE_ALONG_X';
        this.translations['BOUNDING_BOX_SIZE_ALONG_Y'] = 'BOUNDING_BOX_SIZE_ALONG_Y';
        this.translations['BOUNDING_BOX_SIZE_ALONG_Z'] = 'BOUNDING_BOX_SIZE_ALONG_Z';

        this.translations['SURFACE_AREA_ALONG_X'] = 'SURFACE_AREA_ALONG_X';
        this.translations['SURFACE_AREA_ALONG_Y'] = 'SURFACE_AREA_ALONG_Y';
        this.translations['SURFACE_AREA_ALONG_Z'] = 'SURFACE_AREA_ALONG_Z';
        this.translations['LARGEST_FACE_AREA'] = 'LARGEST_FACE_AREA';
        this.translations['TOTAL_SURFACE_AREA'] = 'TOTAL_SURFACE_AREA';

        this.translations['TOTAL_SHAPE_VOLUME'] = 'TOTAL_SHAPE_VOLUME';

        this.bimPropertyListService.propertiesLoaded
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((data: BimPropertyModel[]) => {
                this.setDataSource(data);
            });
    }

    onLoginClick() {
        this.login();
    }

    inCanvasClick(event) {
      if (this.bimServerViewer.viewer.selectedElements.size) {
        console.log('selected elements right now: ', this.bimServerViewer.viewer.selectedElements._set);

      }
    }

    keyPressListener(event) {
      if (event.key === ' ') {
        event.preventDefault();
        console.log('ca doit tourner la');
        this.animationEnabled = !(this.animationEnabled);
        this.bimServerViewer.viewer.navigationActive = this.animationEnabled;
      }
    }

    onLoadDocument(event: any) {
        this.loadModel(this.documentId);
    }

    navigateToProject(info: ProjectInfo) {
        this.loadModel(info.name);
    }

    getObjectsStates(address, phase) {
      const params = new HttpParams().set('Phase', phase);
      console.log(this.http);
      return( this.http.get(address + '?Phase=Demo', { responseType: 'text' }) );
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

    private loadModel(documentName: string) {
        this.dataSource = undefined;
        this.bimPropertyListService.showElementProperties([]);

        this.getProjectByName(documentName, (project: any) => {
            this.getTotalPrimitives([project.roid]).then((totalPrimitives: number) => {
                this.loadProject(project.oid, totalPrimitives + 10000);
            });
        });
    }

    private clear() {
        this.dataSource = undefined;
        this.bimPropertyListService.clear();

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

    private login() {
        this.bimServerClient = new BimServerClient(environment.apiUrl);

        this.bimServerClient.init(() => {
            this.bimServerClient.login(
                environment.login,
                environment.password,
                () => this.loginCallBack(),
                (error: any) => console.log(error));
        });
    }

    private loginCallBack() {
        if (environment.production) {
            this.projectsInfo.push({ name: 'oc_forum', poid: 1 });
            this.projectsInfo.push({ name: 'tcj', poid: 2 });
            this.projectsInfo.push({ name: 'lakeside', poid: 3 });
            this.projectsInfo.push({ name: 'duplex', poid: 4 });
            this.projectsInfo.push({ name: 'dek_cierny', poid: 5 });
            this.projectsInfo.push({ name: 'rd_samta', poid: 6 });
            this.projectsInfo.push({ name: 'kuco', poid: 7 });
            this.projectsInfo.push({ name: 'schepen', poid: 8 });
            this.projectsInfo.push({ name: 'kros', poid: 9 });
            this.projectsInfo.push({ name: 'dek_skladby', poid: 10 });
            this.projectsInfo.push({ name: 'komora', poid: 11 });
            this.projectsInfo.push({ name: 'urs_dds', poid: 12 });
        } else {
            this.bimServerClient.call('ServiceInterface', 'getAllProjects',
                { onlyTopLevel: true, onlyActive: true },
                (projects: any) => this.getAllProjectsCallBack(projects),
                (error: any) => this.errorCallBack(error)
            );
        }
    }

    private getAllProjectsCallBack(projects: any) {
      this.projectsInfo = [];
        projects.slice(0, 10).forEach((project: any) => this.getProjectInfo(project));
    }

    private getProjectInfo(project: any) {
        if (project.lastRevisionId !== -1) {
            this.projectsInfo.push({ name: project.name, poid: project.oid });
        }
    }

    private errorCallBack(error: any) {
        console.error(error);
    }

    private getProjectByName(documentName: string, callback: any) {
        this.bimServerClient.call('ServiceInterface', 'getProjectsByName', { name: documentName }, (projects: any) => {
            callback({ oid: projects[0].oid, roid: projects[0].lastRevisionId });
        }, (error: any) => this.errorCallBack(error));
    }

    private loadProject(poid: number, totalPrimitives: number) {
        this.bimServerClient.call('ServiceInterface', 'getProjectByPoid', {
            poid: poid
        }, (project: any) => {
            this.bimServerClient.getModel(project.oid, project.lastRevisionId, project.schema, false, (model: any) => {
                const canvas = document.getElementById('glcanvas');

                this.roid = project.lastRevisionId;
                this.loadUnits(model);
                this.bimPropertyListService.setModel(model);
                this.bimServerViewer = new BimServerViewer(
                    {
                        triangleThresholdDefaultLayer: totalPrimitives,
                        excludedTypes: this.getExludeTypes(project.schema)
                    },
                    canvas,
                    canvas.clientWidth,
                    canvas.clientHeight,
                    null);
                this.bimServerViewer.viewer.addAnimationListener((deltaTime) => {
                  if (this.animationEnabled) {
                    this.bimServerViewer.viewer.camera.orbitYaw(0.05);
                  }
                });
                this.bimServerViewer.setProgressListener((percentage: number) => {
                    this.progress = Math.round(percentage);
                  if (percentage === 100) {
                    this.getObjectsStates('https://app.flashbim.com/JJPP.php', 'Demo').subscribe(data => {
                      console.log(data);
                      this.div = document.createElement('div', );
                      this.div.innerHTML = data.trim();
                      console.log(this.div);
                      const ids = this.setColorsAccordingToDB();
                    });
                  }
                });
                this.bimServerViewer.loadModel(this.bimServerClient, project).then((data: any) => {
                    const bimSurfer = this.bimServerViewer.viewer;
                    bimSurfer.eventHandler.on('selection_state_changed', (elements: any, isSelected: boolean) => {
                        console.log('hi !');
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
            this.bimPropertyListService.showElementProperties(elements);
            this.getGeometryInfo(elements[0]);

        } else {
            this.dataSource = undefined;
            this.bimPropertyListService.showElementProperties([]);
        }
    }

    private getExludeTypes(schema: string): string[] {
        if (schema === 'ifc4') {
          // return [];
          // return ['IfcSpace', 'IfcOpeningElement', 'IfcOpeningStandardCase'];
          return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation', 'IfcOpeningStandardCase'];

        } else {
          // return [];
          // return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation'];
          return ['IfcSpace', 'IfcOpeningElement'];
        }
    }

    private getTotalPrimitives(roids: any): any {
        return new Promise((resolve, reject) => {
            this.bimServerClient.call('ServiceInterface', 'getNrPrimitivesTotal', { roids: roids }, (totalPrimitives: any) => {
                resolve(totalPrimitives);
            });
        });
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
    public setColorsAccordingToDB() {
      this.bimServerViewer.viewer.setColor( ['660078855'] , [0, 100, 200, 100] );
      this.bimServerViewer.viewer.setColor( ['659947783'] , [100, 200, 0, 100] );
      this.bimServerViewer.viewer.setColor( ['660013319'] , [0, 200, 100, 100] );
    }
    /*public setColorsAccordingToDB() {
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

      this.bimServerClient.call('LowLevelInterface', 'getDataObjectsByType',
        {roid: this.bimServerViewer.revisionId, packageName: 'ifc2x3tc1',
          className: 'IfcBuildingElementProxy', flat: 'false'}, (res) => {
          console.log('res = ', res);
          for (const elem of res) {

            guidToOid.set(elem.values[13].stringValue, elem.oid);
            oidToGuid.set(elem.oid, elem.values[13].stringValue);
          }

          for (let i = 0; i < node.childNodes[0].childNodes.length; i++) {
            const child = node.childNodes[0].childNodes[i];
            console.log('child', child);
            if (child['name'] !== '') {
              databaseIDsAndState.set(child['name'], child['value']);
            }
          }
          console.log('databaseIDsAndState = ', databaseIDsAndState);
          for (const numero of databaseIDsAndState.keys()) {
            const numArray = [numero];
            console.log('setting color of numero, ', numero, colors[databaseIDsAndState.get(numero)]);
            console.log('this.bimServerViewer.viewer.setColor(', numArray, ', ', colors[databaseIDsAndState.get(numero)], ');');
            this.bimServerViewer.viewer.setColor(numArray, colors[databaseIDsAndState.get(numero)]);
          }
        },
        function(res) {
        });
      console.log('result: ', [oidToGuid, guidToOid]);
      return [oidToGuid, guidToOid];
    }*/
}
