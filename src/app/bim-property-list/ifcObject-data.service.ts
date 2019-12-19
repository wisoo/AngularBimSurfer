import {Component, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';
import {map} from 'rxjs/operators';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import {DataResource} from '../resources/ifc-object-resource';

@Injectable({providedIn: 'root'})
export class DataService {
  ifcObject: IFCObject = null;
  properties: BimPropertyListModel;
  constructor(protected http: HttpClient, protected dataResource: DataResource) {}

  public getObject(oid): void {
    this.dataResource.getObject(oid).subscribe(obj => {
      console.log('got the object: ', obj.oid);
      this.ifcObject = obj;
    }, err => console.log('got an error: ', err)
    , () => console.log(('everything completed without failing')));
  }

  public getProperties(oid): void {
    this.dataResource.getObject(oid).subscribe(obj => {
        console.log('got the object: ', obj.oid);
        this.properties = obj.properties;
      }, err => console.log('got an error: ', err)
      , () => console.log(('everything completed without failing')));
  }
}
