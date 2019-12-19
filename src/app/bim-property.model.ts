export class BimPropertyListModel {
    properties: BimPropertyModel[];
    quantities: BimPropertyModel[];
}

export class BimPropertyModel {
    name: string;
    value: string | number | BimPropertyModel[];
}

export class BimPropertyNodeModel {
    constructor(
        public expandable: boolean,
        public name: string,
        public level: number,
        public value: any) {
    }
}
