import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon } from "geojson";
import { ImageEntity } from "./image";
import { SchemaEntity } from "./schema";

@Entity("annotation")
export class AnnotationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "json" })
  data: any;

  @Column({ type: "geometry", nullable: false })
  @IsNotEmpty()
  geometry: Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon;

  @ManyToOne(() => ImageEntity, (image) => image.annotations)
  image: ImageEntity;

  @ManyToOne(() => SchemaEntity)
  schema: SchemaEntity;
}

export type AnnotationModel = Pick<AnnotationEntity, "id" | "data"> & {
  geometry: { type: string; coordinates: Array<any> };
};
