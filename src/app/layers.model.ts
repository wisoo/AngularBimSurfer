export class LayersListModel {
  layers: LayerModel[];
  constructor(layers = []) {
    this.layers = layers;
  }
}

export class LayerModel {
  name: string;
  children?: LayerModel[];
  constructor(name, children = null) {
    this.name = name;
    this.children = children;
  }
}
