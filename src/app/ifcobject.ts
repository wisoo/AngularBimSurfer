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
}
