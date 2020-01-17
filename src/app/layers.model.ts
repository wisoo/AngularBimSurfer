export class LayersListModel {
  layers: LayerModel[];
  constructor(layers = [new LayerModel('name', 'test')]) {
    this.layers = layers;
  }
}

export class LayerModel {
  name: string;
  checked: boolean;
  children?: LayerModel[];
  constructor(name, checked, children = null) {
    this.name = name;
    this.checked = checked;
    this.children = children;
  }
}
