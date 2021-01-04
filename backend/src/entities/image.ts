import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Collection } from "./collection";
import { Annotation } from "./annotation";

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @ManyToOne(() => Collection, (collection) => collection.images)
  collection: Collection;

  @OneToMany(() => Annotation, (annotation) => annotation.image)
  annotations: Array<Annotation>;
}
