import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class IFCObject {
  @PrimaryColumn()
  oid: number;
  @Column()
  ifcId: string;
  @Column()
  name: string;
  @Column()
  SectionNature: string;
  @Column()
  sectionAnnexePiece: string;
  @Column()
  sectionAppartement: string;
  @Column()
  sectionBatiment: string;
  @Column()
  sectionEtage: string;
  @Column()
  sectionPiece: string;
  @Column({
    length: 500
  })
  properties: string;

  constructor(oid: number,
              ifcId: string,
              name: string,
              SectionNature: string,
              sectionAnnexePiece: string,
              sectionAppartement: string,
              sectionBatiment: string,
              sectionEtage: string,
              sectionPiece: string,
              properties: string) {
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
}
