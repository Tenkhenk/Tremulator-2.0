import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { CollectionEntity } from "./collection";

@Entity("schema")
export class SchemaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json" })
  schema: any;

  @ManyToOne(() => CollectionEntity, (collection) => collection.schemas)
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.schema, { onDelete: "CASCADE" })
  annotations: Array<AnnotationEntity>;
}

export type SchemaModel = Pick<SchemaEntity, "id" | "schema">;
