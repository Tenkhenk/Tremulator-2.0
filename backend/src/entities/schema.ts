import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { JSONSchema7 } from "json-schema";
import { pick } from "lodash";
import { collectionEntityToModel, CollectionEntity, CollectionModel } from "./collection";
import { annotationEntityToModel, AnnotationEntity, AnnotationModel } from "./annotation";

@Entity("schema")
export class SchemaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: "json" })
  schema: JSONSchema7;

  @Column({ type: "json" })
  ui: any;

  @ManyToOne(() => CollectionEntity, (collection) => collection.schemas, { onDelete: "CASCADE" })
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.schema)
  annotations: Array<AnnotationEntity>;
}

/**
 * Object model: just the table properties
 */
export type SchemaModel = Pick<SchemaEntity, "id" | "name" | "ui"> & { schema: { [key: string]: any } };

// usefull type for creation
export type SchemaModelWithoutId = Omit<SchemaModel, "id">;
export function schemaEntityToModel(item: SchemaEntity): SchemaModel {
  return pick(item, ["id", "name", "schema", "ui"]);
}

/**
 * Object full
 */
export type SchemaModelFull = SchemaModel & {
  collection: CollectionModel;
  annotations: Array<AnnotationModel>;
};
export function schemaEntityToModelFull(item: SchemaEntity): SchemaModelFull {
  return {
    ...pick(item, ["id", "name", "schema", "ui"]),
    collection: collectionEntityToModel(item.collection),
    annotations: item.annotations?.map((a) => annotationEntityToModel(a)) || [],
  };
}
