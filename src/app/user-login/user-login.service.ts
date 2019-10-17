import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { ProjectInfo } from '../project-info.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class UserLoginService {
  env = environment;
  bimServerClient: BimServerClient;
  projectsInfo: [ProjectInfo];
  private subject = new Subject<any>();

  constructor() {
    console.log('inside login service');
    this.bimServerClient = new BimServerClient(environment.apiUrl);
  }

  login(username, password) {
    this.bimServerClient.init(() => {
      this.bimServerClient.login(
        username,
        password,
        () => this.loginCallBack(),
        (error: any) => console.log(error));
    });
  }

  /*private login() {
    this.bimServerClient = new BimServerClient(environment.apiUrl);
    this.bimServerClient.init(() => {
      this.bimServerClient.login(
        environment.login,
        environment.password,
        () => this.loginCallBack(),
        (error: any) => console.log(error));
    });
  }*/

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
}
