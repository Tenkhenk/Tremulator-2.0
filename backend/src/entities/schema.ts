import {
  BaseEntity,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  RelationId,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { pick, omit } from "lodash";
import { collectionEntityToModel, CollectionEntity, CollectionModel } from "./collection";
import { annotationEntityToModel, AnnotationEntity, AnnotationModel } from "./annotation";

@Entity("schema")
export class SchemaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: "json" })
  schema: any;

  @Column({ type: "json" })
  ui: any;

  @ManyToOne(() => CollectionEntity, (collection) => collection.schemas, { onDelete: "CASCADE" })
  collection: CollectionEntity;

  @RelationId((a: SchemaEntity) => a.collection)
  collection_id: number;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.schema)
  annotations: Array<AnnotationEntity>;

  @RelationId((a: SchemaEntity) => a.annotations)
  annotations_id: number[];
}

// For forms
export type SchemaData = Pick<SchemaEntity, "name" | "color" | "schema" | "ui">;
// Just the table properties with forgein keys
export type SchemaModel = Pick<
  SchemaEntity,
  "id" | "created_at" | "updated_at" | "name" | "color" | "schema" | "ui" | "collection_id"
> & { nb_annotations: number };
// Full
export type SchemaModelFull = Omit<SchemaModel, "collection_id"> & {
  collection: CollectionModel;
};

export function schemaEntityToModel(item: SchemaEntity): SchemaModel {
  return {
    ...omit(item, ["collection", "annotations", "annotations_id"]),
    nb_annotations: item.annotations_id?.length || 0,
  };
}

export function schemaEntityToModelFull(item: SchemaEntity): SchemaModelFull {
  return {
    ...omit(item, ["collection", "collection_id", "annotations", "annotations_id"]),
    nb_annotations: item.annotations_id?.length || 0,
    collection: collectionEntityToModel(item.collection),
  };
}
