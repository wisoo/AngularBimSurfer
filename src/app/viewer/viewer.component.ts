import { Component, AfterViewInit } from '@angular/core';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { BimServerViewer } from '@slivka/surfer/viewer/bimserverviewer';
import { ProjectInfo } from '../project-info.model';
import { environment } from 'src/environments/environment';
import {UserLoginService} from '../user-login/user-login.service';
import {Subscription} from 'rxjs';


export interface Direction {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent {

  env = environment;
  title = 'bim-surfer';
  documentId = '';
  projectsInfo: ProjectInfo[] = [];
  bimServerClient: BimServerClient;
  bimServerViewer: BimServerViewer;
  camera: any;
  progress = 0;
  messages: any[] = [];
  subscription: Subscription;
  
  directions: Direction[] = [
    { value: '0', viewValue: 'No section' },
    { value: '1', viewValue: 'Free section' },
    { value: '2', viewValue: 'X-axis' },
    { value: '3', viewValue: 'Y-axis' },
    { value: '4', viewValue: 'Z-axis' }
  ];

  constructor(private service: UserLoginService) {
    this.subscription = this.messageService.getMessage().subscribe(message => {
      if (message) {
        this.messages.push(message);
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });
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
