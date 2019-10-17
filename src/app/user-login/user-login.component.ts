import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { BimServerViewer } from '@slivka/surfer/viewer/bimserverviewer';
import { ProjectInfo } from '../project-info.model';
import { environment } from 'src/environments/environment';
import {Direction} from '../viewer/viewer.component';
import {UserLoginService} from './user-login.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements AfterViewInit, OnDestroy {

  env = environment;
  title = 'bim-surfer';
  documentId = '';
  projectsInfo: ProjectInfo[] = [];
  bimServerClient: BimServerClient;
  bimServerViewer: BimServerViewer;
  camera: any;
  progress = 0;
  subscription: Subscription;

  directions: Direction[] = [
    { value: '0', viewValue: 'No section' },
    { value: '1', viewValue: 'Free section' },
    { value: '2', viewValue: 'X-axis' },
    { value: '3', viewValue: 'Y-axis' },
    { value: '4', viewValue: 'Z-axis' }
  ];

  constructor(private userLoginService: UserLoginService) {
  }

  ngAfterViewInit() {
    this.userLoginService.login(this.env.login, this.env.password);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLoginClick() {
    this.userLoginService.login(this.env.login, this.env.password);
  }

  onLoadDocument(event: any) {
    this.loadModel(this.documentId);
  }

  navigateToProject(info: ProjectInfo) {
    this.loadModel(info.name);
  }

  onDirectionChange(event: any) {
    this.bimServerViewer.settings.sectionPlaneDirection = Number(event.value);

    if (this.bimServerViewer.settings.sectionPlaneDirection === 0) {
      this.bimServerViewer.viewer.removeSectionPlaneWidget();
      this.bimServerViewer.viewer.disableSectionPlane();
    }
  }

  private loadModel(documentName: string) {
    this.getProjectByName(documentName, (project: any) => {
      this.getTotalPrimitives([project.roid]).then((totalPrimitives: number) => {
        this.loadProject(project.oid, totalPrimitives + 10000);
      });
    });
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
      this.bimServerClient.call('ServiceInterface', 'getAllProjects',
        { onlyTopLevel: true, onlyActive: true },
        (projects: any) => this.getAllProjectsCallBack(projects),
        (error: any) => this.errorCallBack(error)
      );
    } else {
      this.bimServerClient.call('ServiceInterface', 'getAllProjects',
        { onlyTopLevel: true, onlyActive: true },
        (projects: any) => this.getAllProjectsCallBack(projects),
        (error: any) => this.errorCallBack(error)
      );
    }
  }

  private getAllProjectsCallBack(projects: any) {
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
      poid
    }, (project: any) => {
      const canvas = document.getElementById('glcanvas');

      this.bimServerViewer = new BimServerViewer(
        {
          triangleThresholdDefaultLayer: totalPrimitives,
          excludedTypes: this.getExludeTypes(project.schema)
        },
        canvas,
        canvas.clientWidth,
        canvas.clientHeight,
        null);

      this.bimServerViewer.setProgressListener((percentage: number) => {
        this.progress = Math.round(percentage);
      });

      // this.bimServerViewer.viewer.addAnimationListener((deltaTime) => {
      //     this.bimServerViewer.viewer.camera.orbitYaw(0.3);
      // });

      this.bimServerViewer.loadModel(this.bimServerClient, project);
    });
  }

  private getExludeTypes(schema: string): string[] {
    if (schema === 'ifc4') {
      return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation', 'IfcOpeningStandardCase'];
    } else {
      return ['IfcSpace', 'IfcOpeningElement', 'IfcAnnotation'];
    }
  }

  getTotalPrimitives(roids: any): any {
    return new Promise((resolve, reject) => {
      this.bimServerClient.call('ServiceInterface', 'getNrPrimitivesTotal', { roids }, (totalPrimitives: any) => {
        resolve(totalPrimitives);
      });
    });
  }

}
