import {BimPropertyListModel} from '../bim-property.model';

export class IFCObject {
  oid: number;
  ifcId: string;
  name: string;
  SectionNature: string;
  sectionAnnexePiece: string;
  sectionAppartement: string;
  sectionBatiment: string;
  sectionEtage: string;
  sectionPiece: string;
  properties: BimPropertyListModel;
  constructor(oid: number,
              ifcId: string,
              name: string,
              SectionNature: string,
              sectionAnnexePiece: string,
              sectionAppartement: string,
              sectionBatiment: string,
              sectionEtage: string,
              sectionPiece: string,
              properties: BimPropertyListModel) {
    this.properties = properties;
    this.ifcId = ifcId;
    this.oid = oid;
    this.sectionPiece = sectionPiece;
    this.SectionNature = SectionNature;
    this.sectionEtage = sectionEtage;
    this.sectionBatiment = sectionBatiment;
    this.sectionAppartement = sectionAppartement;
    this.name = name;
    this.sectionAnnexePiece = sectionAnnexePiece;
  }

  public static fromJson(json: Object): IFCObject {
    return new IFCObject(
      json['oid'],
      json['ifcId'],
      json['name'],
      json['SectionNature'] ,
      json['sectionAnnexePiece'],
      json['sectionAppartement'],
      json['sectionBatiment'],
      json['sectionEtage'],
      json['sectionPiece'],
      json['properties']);
  }
}
