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

  @ManyToOne(() => CollectionEntity, (collection) => collection.schemas)
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.schema, { cascade: true, onDelete: "CASCADE" })
  annotations: Array<AnnotationEntity>;
}

/**
 * Object model: just the table properties
 */
export type SchemaModel = Pick<SchemaEntity, "id" | "name"> & { schema: { [key: string]: any } };
export function schemaEntityToModel(item: SchemaEntity): SchemaModel {
  return pick(item, ["id", "name", "schema"]);
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
    ...pick(item, ["id", "name", "schema"]),
    collection: collectionEntityToModel(item.collection),
    annotations: item.annotations?.map((a) => annotationEntityToModel(a)) || [],
  };
}
