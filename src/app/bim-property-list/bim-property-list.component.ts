import { Component, OnInit } from '@angular/core';
import {DataService} from './ifcObject-data.service';
import {BimPropertyModel} from '../bim-property.model';
import { Observable, of } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {IFCObject} from '../classes/ifcObjectEntity';

@Component({
  selector: 'app-bim-property-list',
  templateUrl: './bim-property-list.component.html',
  styleUrls: ['./bim-property-list.component.scss']
})
export class BimPropertyListComponent implements OnInit {
  bimProperties: BimPropertyModel = null;
  ifcObject: IFCObject = null;
  constructor(private dataService: DataService) {}
  ngOnInit() {}
}
