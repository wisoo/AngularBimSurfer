import { Component, OnInit } from '@angular/core';
import {DataService} from './ifcObject-data.service';
import {BimPropertyListModel, BimPropertyModel} from '../bim-property.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {IFCObject} from '../classes/ifcObjectEntity';
import * as HTMLStringify from 'html-stringify';
import {retryWhen, tap} from 'rxjs/operators';

@Component({
  selector: 'app-bim-property-list',
  templateUrl: './bim-property-list.component.html',
  styleUrls: ['./bim-property-list.component.scss']
})
export class BimPropertyListComponent implements OnInit {
  bimProperties: BimPropertyListModel = null;
  treeControl = new NestedTreeControl<BimPropertyModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<BimPropertyModel>();
  constructor(public dataService: DataService) {
    this.dataSource.data =  [new BimPropertyModel('properties', {})];
  }
  hasChild = (_: number, node: BimPropertyModel) => !!node.children && node.children.length > 0;
  ngOnInit() {
    const ifcObjectSubscription = this.dataService.ifcObject$.subscribe(
      (ifcObject: IFCObject) => {
        if (ifcObject != null) {
          console.log('bimpropertylist ifcObject:', ifcObject);
          this.updateDatasource(ifcObject);
        } else {
          console.log('bimpropertylist ISNULL');
        }
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
      });
  }
  updateDatasource(ifcObject: IFCObject) {
    this.dataSource.data = ifcObject.properties.properties;
    console.log(ifcObject.properties.properties);
  }
}
