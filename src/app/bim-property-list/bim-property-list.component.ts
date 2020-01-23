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
  propertiesDataSource = new MatTreeNestedDataSource<BimPropertyModel>();
  quantitiesDataSource = new MatTreeNestedDataSource<BimPropertyModel>();
  constructor(public dataService: DataService) {
    this.propertiesDataSource.data =  [new BimPropertyModel('properties', {})];
    this.quantitiesDataSource.data =  [new BimPropertyModel('properties', {})];
  }
  hasChild = (_: number, node: BimPropertyModel) => !!node.children && node.children.length > 0;
  ngOnInit() {
    const ifcObjectSubscription = this.dataService.ifcObject$.subscribe(
      (ifcObject: IFCObject) => {
        if (ifcObject != null) {
          this.updatePropertiesDatasource(ifcObject);
          this.updateQuantitiesDatasource(ifcObject);
        }
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
      });
  }
  updatePropertiesDatasource(ifcObject: IFCObject) {
    this.propertiesDataSource.data = ifcObject.properties.properties;
  }
  updateQuantitiesDatasource(ifcObject: IFCObject) {
    this.quantitiesDataSource.data = ifcObject.properties.quantities;
  }
}
