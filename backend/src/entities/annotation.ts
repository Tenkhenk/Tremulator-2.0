import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { pick } from "lodash";
import { GeoJsonObject } from "geojson";
import { imageEntityToModel, ImageEntity, ImageModel } from "./image";
import { schemaEntityToModel, SchemaEntity, SchemaModel } from "./schema";

@Entity("annotation")
export class AnnotationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json" })
  data: any;

  @Column({ type: "geometry", nullable: false })
  @IsNotEmpty()
  geometry: GeoJsonObject;

  @Column({ type: "json", nullable: true })
  @IsNotEmpty()
  geometry_props: any;

  @ManyToOne(() => ImageEntity, (image) => image.annotations, { onDelete: "CASCADE" })
  image: ImageEntity;

  @ManyToOne(() => SchemaEntity, { onDelete: "CASCADE" })
  schema: SchemaEntity;
}

/**
 * Object model: just the table properties
 */
export type AnnotationModel = Pick<AnnotationEntity, "id" | "data"> & {
  geometry: any;
};
// usefull type for creation
export type AnnotationModelWithoutId = Omit<AnnotationModel, "id">;
export function annotationEntityToModel(item: AnnotationEntity): AnnotationModel {
  return pick(item, ["id", "data", "geometry"]);
}

/**
 * Object full : model with the deps in model format
 */
export type AnnotationModelFull = Pick<AnnotationEntity, "id" | "data"> & {
  geometry: { type: string };
  schema: SchemaModel;
  image: ImageModel;
};
export function annotationEntityToModelFull(item: AnnotationEntity): AnnotationModelFull {
  return {
    ...pick(item, ["id", "data", "geometry"]),
    schema: schemaEntityToModel(item.schema),
    image: imageEntityToModel(item.image),
  };
}
