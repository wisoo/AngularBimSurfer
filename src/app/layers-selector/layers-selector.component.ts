import { Component, OnInit } from '@angular/core';
import {Layer, Layers, LayerService} from './layer.service';
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
  layerListModel: LayersListModel = null;
  treeControl = new NestedTreeControl<LayerModel>(node => node.children);
  dataSource = new MatTreeNestedDataSource<LayerModel>();
  constructor(public dataService: LayerService) {
    this.dataSource.data = null;
  }
  checklistSelection = new SelectionModel<LayerModel>(true /* multiple */);

  hasChild = (_: number, node: LayerModel) => !!node.children && node.children.length > 0;
  hasNoContent = (_: number, _nodeData: LayerModel) => _nodeData.name === '';


  ngOnInit() {
    const layersSubscription = this.dataService.layers$.subscribe(
      (layers: Layers) => {
        if (layers != null) {
          this.updateDatasource(layers);
          this.sendActiveLayers();
        }
      },
      (error) => {
        console.log('Uh-oh, an error occurred! : ' + error);
      },
      () => {
      });
  }
  updateDatasource(layers: Layers) {
    this.layerListModel = new LayersListModel();

    for (const layer of layers.layers) {
      const newLayer = new LayerModel(layer.calque, null);
      newLayer.children = null;
      this.layerListModel.layers.push(newLayer);
    }
    this.dataSource.data = this.layerListModel.layers;
    this.checklistSelection.select(...this.layerListModel.layers);
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
    this.sendActiveLayers();
  }

  sendActiveLayers(): void {
    // send ActiveLayers to subscribers via observable subject
    this.dataService.sendActiveLayers(this.checklistSelection.selected);
  }

  clearActiveLayers(): void {
    // clear ActiveLayers
    this.dataService.clearActiveLayers();
  }

  sendOidsByLayers(): void {
    // send layer-oids map
    this.dataService.sendLayerOidsMap();
  }
}


