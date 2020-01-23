import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LayerResource} from '../resources/layer-resource';
import {LayerModel} from '../layers.model';


export class Layer {
  calque: string;
}

export class Layers {
  layers: Array<Layer>;
}


@Injectable({providedIn: 'root'})
export class LayerService implements OnDestroy {
  private layers: BehaviorSubject<Layers> = new BehaviorSubject( null);
  public readonly layers$: Observable<Layers> = this.layers.asObservable();
  private dataResourceSubscription: Subscription;
  private subject = new Subject<any>();
  private layerOidsMapSubject = new Subject<any>();
  public getLayers() {
    this.dataResourceSubscription = this.layerResource.getLayers().subscribe(
      (layers) => {
        this.layers.next(layers);
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
      });
    return this.layers$;
  }

  sendActiveLayers(message: LayerModel[]) {
    this.subject.next(message);
  }

  sendLayerOidsMap(): void {
    this.layerResource.getOidsByLayer().subscribe(
      (value) => this.layerOidsMapSubject.next(value),
      (error) => console.log('an error occurred with oidByLayerMap Observable', error),
      () => {});
  }

  getLayerOidsMap(): Observable<Map<string, Array<Number>>> {
    return this.layerOidsMapSubject.asObservable();
  }

  getActiveLayers(): Observable<any> {
    return this.subject.asObservable();
  }

  clearActiveLayers(): void {
    this.subject.next();
  }

  constructor(protected http: HttpClient, protected layerResource: LayerResource) {
  }

  ngOnDestroy(): void {
  }
}
