import { Component, OnInit } from '@angular/core';
import {DataService} from './ifcObject-data.service';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import { Observable, of } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {IFCObject} from '../classes/ifcObjectEntity';

@Component({
  selector: 'app-bim-property-list',
  templateUrl: './bim-property-list.component.html',
  styleUrls: ['./bim-property-list.component.scss']
})
export class BimPropertyListComponent implements OnInit {
  bimProperties: BimPropertyListModel = null;
  public ifcObject: IFCObject = new IFCObject(0, '', '', '', '',
    '' , '', '', '', new BimPropertyListModel());

  constructor(public dataService: DataService) {
  }
  ngOnInit() {
    this.bimProperties = this.dataService.properties;
    this.dataService.getValue().subscribe((value) => {
      console.log('value changed: ', value);
      this.ifcObject = value;
    });
  }
}
