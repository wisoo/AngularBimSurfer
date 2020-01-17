import { Component, OnInit } from '@angular/core';
import {Layer, LayerService} from './layer.service';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {IFCObject} from '../classes/ifcObjectEntity';
import * as HTMLStringify from 'html-stringify';
import {retryWhen, tap} from 'rxjs/operators';
import {LayerModel, LayersListModel} from '../layers.model';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-layers-selector',
  templateUrl: './layers-selector.component.html',
  styleUrls: ['./layers-selector.component.scss']
})
export class LayersSelectorComponent implements OnInit {
  layers: LayersListModel = null;
  treeControl = new NestedTreeControl<LayerModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<LayerModel>();
  constructor(public dataService: LayerService) {
    this.dataSource.data =  [new LayerModel('GOE', false)];
  }
  checklistSelection = new SelectionModel<LayerModel>(true /* multiple */);

  hasChild = (_: number, node: LayerModel) => !!node.children && node.children.length > 0;
  hasNoContent = (_: number, _nodeData: LayerModel) => _nodeData.name === '';


  ngOnInit() {
    const layersSubscription = this.dataService.layers$.subscribe(
      (layers: Layer[]) => {
        if (layers != null) {
          console.log('layers:', layers);
          this.updateDatasource(layers);
        } else {
          console.log('layer list ISNULL');
        }
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
        console.log('Observable complete!');
      });
  }
  updateDatasource(layers: Layer[]) {
    console.log(layers);
    console.log(' pouet ');
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: LayerModel): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: LayerModel): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: LayerModel): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }
}
