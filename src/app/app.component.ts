import {Component, OnInit} from '@angular/core';
import { BimServerClient } from 'bimserverapi/bimserverclient';
import { BimServerViewer } from '@micaw/bimsurfer3/viewer/bimserverviewer';
import { Settings } from '@micaw/bimsurfer3/viewer/settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
    let api = new BimServerClient('http://46.105.124.137:8080/bimserver');
    api.init(() => {
      console.log(api);
      api.login('wacim.yassine@syscobat.com', 'admin', () => {
        // So now authentication has succeeded, make sure that for a real implementation you also check for errors
        api.call('ServiceInterface', 'getProjectByPoid', {poid: '131073'}, (project) => {
          let canvas = document.getElementById('glcanvas');
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
