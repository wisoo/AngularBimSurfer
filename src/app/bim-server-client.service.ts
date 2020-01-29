import { Injectable } from '@angular/core';
import { BimServerClient } from 'bimserverapi/BimServerClient';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BimServerClientService {
  private static instance: BimServerClient;
  private constructor() {
  }

  public static getInstance() {
    if (!BimServerClientService.instance) {
      BimServerClientService.instance = new BimServerClient(environment.apiUrl);
    }
    return BimServerClientService.instance;
  }

  /*public async login(id: string, pwd: string) {
     BimServerClientService.instance.init(() => {
       BimServerClientService.instance.login(id, pwd, () => console.log('login successful'),
        (error: any) => console.log(error));
    });
  }*/
}
