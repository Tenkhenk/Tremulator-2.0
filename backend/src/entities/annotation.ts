import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  RelationId,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { pick, omit } from "lodash";
import { GeoJsonObject } from "geojson";
import { imageEntityToModel, ImageEntity, ImageModel } from "./image";
import { schemaEntityToModel, SchemaEntity, SchemaModel } from "./schema";

@Entity("annotation")
export class AnnotationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "json" })
  data: any;

  @Column({ type: "geometry", nullable: false })
  @IsNotEmpty()
  geometry: any;

  @Column()
  maxZoom: number;

  @ManyToOne(() => ImageEntity, (image) => image.annotations, { onDelete: "CASCADE" })
  image: ImageEntity;

  @RelationId((a: AnnotationEntity) => a.image)
  image_id: number;

  @ManyToOne(() => SchemaEntity, { onDelete: "CASCADE" })
  schema: SchemaEntity;

  @RelationId((a: AnnotationEntity) => a.schema)
  schema_id: number;
}

// For forms
export type AnnotationData = Pick<AnnotationEntity, "data" | "geometry" | "maxZoom">;
// Just the table properties with forgein keys
export type AnnotationModel = Pick<
  AnnotationEntity,
  "id" | "created_at" | "updated_at" | "data" | "geometry" | "maxZoom" | "image_id" | "schema_id"
>;

// Full
export type AnnotationModelFull = Omit<AnnotationModel, "image_id" | "schema_id"> & {
  schema: SchemaModel;
  image: ImageModel;
};

export function annotationEntityToModel(item: AnnotationEntity): AnnotationModel {
  return omit(item, ["image", "schema"]);
}

export function annotationEntityToModelFull(item: AnnotationEntity): AnnotationModelFull {
  return {
    ...omit(item, ["image_id", "schema_id", "schema", "image"]),
    schema: schemaEntityToModel(item.schema),
    image: imageEntityToModel(item.image),
  };
}
