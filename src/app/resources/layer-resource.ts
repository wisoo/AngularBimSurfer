import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { map } from 'rxjs/operators';
import {IFCObject} from '../classes/ifcObjectEntity';

import {stringify} from 'querystring';
import {catchError, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Layer, Layers} from '../layers-selector/layer.service';

@Injectable({
  providedIn: 'root'
})
export class LayerResource {
  constructor(protected http: HttpClient) {}

  public getLayers(): Observable<Layers> {
    const url = 'http://localhost:3000/layer/';
    return this.http.get(url).pipe(map((response: Array<Layer>) => {
      const layers = new Layers();
      layers.layers = response;
      return layers;
    }));
  }

  public getOidsByLayer(): Observable<Map<string, Array<Number>>> {
    const url = 'http://localhost:3000/layer/map';
    const temp: Observable<Map<string, Array<Number>>> =
      this.http.get(url).pipe(map((response: Array<{calque: string, oids: Array<Number>}>) => {
      const oidsByLayer = new Map<string, Array<Number>>();
      if (response) {
        for (const layer of response) {
          oidsByLayer.set(layer.calque, layer.oids);
        }
      }
      return oidsByLayer;
    }));
    return temp;
  }
  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {

      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    return throwError(errorMessage);
  }
}
