import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject, Subscription} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import {DataResource} from '../resources/ifc-object-resource';

@Injectable({providedIn: 'root'})
export class DataService implements OnDestroy {
  private ifcObject: BehaviorSubject<IFCObject> = new BehaviorSubject(null);
  public readonly ifcObject$: Observable<IFCObject> = this.ifcObject.asObservable();
  public ifcObjectHTML: string;
  private dataResourceSubscription: Subscription;

  public getObject(oid) {
    if (oid === null) {
      return new IFCObject(0, '', '', '', '',
        '' , '', '', '', new BimPropertyListModel());
    }

    this.dataResourceSubscription = this.dataResource.getObject(oid).subscribe(
      (ifcObject) => {
        this.ifcObject.next(ifcObject);
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {});
    return this.ifcObject$;
  }

  constructor(protected http: HttpClient, protected dataResource: DataResource) {
  }

  ngOnDestroy(): void {
  }
}
