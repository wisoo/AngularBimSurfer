import {Component, OnInit} from '@angular/core';
import { BimServerClient } from 'bimserverapi/bimserverclient';
import { BimServerViewer } from '@slivka/surfer/viewer/bimserverviewer';
import { Settings } from '@slivka/surfer/viewer/settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fromScratch';
  settingsView: Settings;
  settingsElement: HTMLElement;
  settings: {drawTileBorders: boolean};
  bimServerViewer: BimServerViewer;
  ngOnInit(): void {
    this.settingsElement = document.createElement('div');
    this.settingsView = new Settings(this.settingsElement);
    this.settings = JSON.parse(JSON.stringify(this.settingsView.settings));
    console.log(this.settings);
    this.settings.drawTileBorders = false;
    const api = new BimServerClient('http://46.105.124.137:8080/bimserver');
    api.init(() => {
      console.log(api);
      api.login('wacim.yassine@syscobat.com', 'admin', () => {
        // So now authentication has succeeded, make sure that for a real implementation you also check for errors
        api.call('ServiceInterface', 'getProjectByPoid', {poid: '131073'}, (project) => {
          const canvas = document.getElementById('glcanvas');
          console.log(canvas);
          console.log(project);
          this.bimServerViewer = new BimServerViewer(this.settings, canvas, null, null, null);
          this.bimServerViewer.loadModel(api, project);
        }, (error) => {
          console.log('error in call', error);
        }); },
        () => {console.log('authentication failed'); });
    });
  }
}
