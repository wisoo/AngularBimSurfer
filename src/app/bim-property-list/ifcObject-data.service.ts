import { Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';
import {catchError, tap, map} from 'rxjs/operators';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import {DataResource} from '../resources/ifc-object-resource';

@Injectable({providedIn: 'root'})
export class DataService {
  ifcObject: IFCObject = null;
  ifcObjectInfo: BehaviorSubject<IFCObject>;

  properties: BimPropertyListModel;

  setValue(newValue): void {
    this.ifcObjectInfo.next(newValue);
  }
  getValue(): Observable<IFCObject> {
    return this.ifcObjectInfo.asObservable();
  }
  constructor(protected http: HttpClient, protected dataResource: DataResource) {
    this.ifcObject = new IFCObject(0, '', '', '', '',
      '' , '', '', '', new BimPropertyListModel());
    this.ifcObjectInfo = new BehaviorSubject<IFCObject>(this.ifcObject);
  }

  public getObject(oid): void {
    this.dataResource.getObject(oid).subscribe(obj => {
      console.log('got the object: ', obj.oid);
      this.ifcObject = obj;
      this.setValue(this.ifcObject);
    }, err => console.log('got an erroro: ', err)
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
