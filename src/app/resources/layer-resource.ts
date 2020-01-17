import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';

import {stringify} from 'querystring';
import {catchError, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Layer} from '../layers-selector/layer.service';

@Injectable({
  providedIn: 'root'
})
export class LayerResource {
  constructor(protected http: HttpClient) {}

  public getLayers(): Observable<Layer> {
    console.log('request sent to srv by resource');
    const url = 'http://localhost:3000/layer/';
    return this.http.get<Layer>(url);
  }
  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {

      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
