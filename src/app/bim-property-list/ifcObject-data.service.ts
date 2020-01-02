import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';
import {catchError, tap, map} from 'rxjs/operators';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import {DataResource} from '../resources/ifc-object-resource';

@Injectable({providedIn: 'root'})
export class DataService {
  private ifcObject: BehaviorSubject<IFCObject> = new BehaviorSubject(null);
  public readonly ifcObject$: Observable<IFCObject> = this.ifcObject.asObservable();

  public getObject(oid) {
    console.log(oid);
    if (oid === null) {
      return this.ifcObject.next(new IFCObject(0, '', '', '', '',
        '' , '', '', '', new BimPropertyListModel()));
    }
    return this.dataResource.getObject(oid).subscribe((ifcObject) => this.ifcObject.next(ifcObject));
  }
  constructor(protected http: HttpClient, protected dataResource: DataResource) {
  }

 /*public getObject(oid): void {
    this.dataResource.getObject(oid).subscribe(obj => {
      console.log('got the object: ', obj.oid);
      this.ifcObject = obj;
      this.setValue(this.ifcObject);
    }, err => console.log('got an erroro: ', err)
    , () => console.log(('everything completed without failing')));
  }*/

  /*public getProperties(oid): void {
    this.dataResource.getObject(oid).subscribe(obj => {
        console.log('got the object: ', obj.oid);
        this.properties = obj.properties;
      }, err => console.log('got an error: ', err)
      , () => console.log(('everything completed without failing')));
  }*/
}
