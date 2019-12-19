import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IFCObject} from '../classes/ifcObjectEntity';

export class DataResource {
  constructor(protected http: HttpClient) {}

  public getObject(oid): Observable<IFCObject> {
    return this.http.get<IFCObject>('http://46.105.124.137/' + oid);
  }
}
