export class BimPropertyListModel {
    properties: BimPropertyModel[];
    constructor(properties = [new BimPropertyModel('name', 'test')]) {
      this.properties = properties;
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
