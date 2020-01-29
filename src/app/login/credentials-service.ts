import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import { ProjectInfo } from '../project-info.model';
import {Observable, Subject} from 'rxjs';
import {BimServerClientService} from '../bim-server-client.service';

@Injectable({providedIn: 'root'})
export class CredentialsService implements OnDestroy {
  public projectsInfo: ProjectInfo[] = [];
  bimServerClient: BimServerClient;
  private subject = new Subject<any>();
  private projectsSubject = new Subject<any>();
  constructor() {
    this.bimServerClient = BimServerClientService.getInstance();
  }

  sendCredentials(credentials: {email: string, pwd: string}) {
    this.subject.next(credentials);
  }

  sendProjects(projects: ProjectInfo[]) {
    this.projectsSubject.next(projects);
  }

  clearCredentials() {
    this.subject.next();
  }

  clearProjects() {
    this.projectsSubject.next();
  }

  getProjects(): Observable<any> {
    return this.projectsSubject.asObservable();
  }

  getCredentials(): Observable<any> {
    return this.subject.asObservable();
  }

  private loginCallBack() {
    this.bimServerClient.call('ServiceInterface', 'getAllProjects',
      {onlyTopLevel: true, onlyActive: true},
      (projects: any) => {
        this.getAllProjectsCallBack(projects);
      },
      (error: any) => this.errorCallBack(error));
  }

  private getAllProjectsCallBack(projects: any) {
    this.projectsInfo = [];
    projects.slice(0, 10).forEach((project: any) => this.getProjectInfo(project));
    this.sendProjects(this.projectsInfo);
  }

  private errorCallBack(error: any) {
    console.error(error);
  }

  private getProjectInfo(project: any) {
    if (project.lastRevisionId !== -1) {
      this.projectsInfo.push({ name: project.name, poid: project.oid });
    }
  }

  public login(id: string, pwd: string) {
    this.bimServerClient = BimServerClientService.getInstance();

    this.bimServerClient.init(() => {
      this.bimServerClient.login(id, pwd, () => this.loginCallBack(),
        (error: any) => console.log(error));
    });
  }
  public ngOnDestroy(): void {
  }
}
