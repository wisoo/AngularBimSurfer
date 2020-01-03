import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';

import {stringify} from 'querystring';
import {catchError, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataResource {
  constructor(protected http: HttpClient) {}

  public getObject(oid): Observable<IFCObject> {
    console.log('request sent to srv, oid:', oid);
    const url = 'http://46.105.124.137:3000/ifcObject/' + oid.toString();
    return this.http.get<IFCObject>(url);
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
