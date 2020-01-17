import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError, BehaviorSubject, Subscription} from 'rxjs';
import {LayerResource} from '../resources/layer-resource';


export class Layer {
  calque: string;
}


@Injectable({providedIn: 'root'})
export class LayerService implements OnDestroy {
  private layers: BehaviorSubject<Layer[]> = new BehaviorSubject( null);
  public readonly layers$: Observable<Layer[]> = this.layers.asObservable();
  private dataResourceSubscription: Subscription;

  public getLayers() {
    this.dataResourceSubscription = this.layerResource.getLayers().subscribe(
      (layers) => {
        console.log('layerService layers:', layers);
        this.layers.next([layers]);
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
      });
    return this.layers$;
  }

  constructor(protected http: HttpClient, protected layerResource: LayerResource) {
  }

  ngOnDestroy(): void {
  }
}
