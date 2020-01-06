export class BimPropertyListModel {
    properties: BimPropertyModel[];
    quantities: BimPropertyModel[];
    constructor(properties = [new BimPropertyModel('name', 'test')], quantities = [new BimPropertyModel('name', 'test')]) {
      this.properties = properties;
      this.quantities = quantities;
    }
}

export class BimPropertyModel {
    name: string;
    value?: string | number;
    children?: BimPropertyModel[];
    constructor(name, value, children = null) {
      this.name = name;
      this.value = value;
      this.children = children;
    }
}

export class BimPropertyNodeModel {
    constructor(
        public expandable: boolean,
        public name: string,
        public level: number,
        public value: any) {
    }
}
