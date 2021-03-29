import {
  AfterRemove,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  RelationId,
} from "typeorm";
import { IsNotEmpty, IsUrl } from "class-validator";
import { omit, pick } from "lodash";
import * as fs from "fs";
import { collectionEntityToModel, CollectionEntity, CollectionModel } from "./collection";
import { annotationEntityToModel, AnnotationEntity, AnnotationModel } from "./annotation";
import { getLogger, Logger } from "../services/logger";

// logger
const log: Logger = getLogger("image");

@Entity("image")
export class ImageEntity extends BaseEntity {
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
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: false })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: false })
  order: number;

  @ManyToOne(() => CollectionEntity, (collection) => collection.images, { onDelete: "CASCADE" })
  collection: CollectionEntity;

  @RelationId((i: ImageEntity) => i.collection)
  collection_id: number;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.image)
  annotations: Array<AnnotationEntity>;

  @RelationId((i: ImageEntity) => i.annotations)
  annotations_id: number[];

  @AfterRemove()
  removeFile() {
    try {
      fs.unlinkSync(this.path);
    } catch (e) {
      // silent exception, we just log it
      log.error("Failed to delete image file", e);
    }
  }
}

// For forms
export type ImageData = Pick<ImageEntity, "name" | "url">;
// Just the table properties with forgein keys
export type ImageModel = Pick<
  ImageEntity,
  "id" | "created_at" | "updated_at" | "name" | "order" | "url" | "collection_id" | "width" | "height"
> & {
  nb_annotations: number;
};
// Full
export type ImageModelFull = Omit<ImageModel, "collection_id" | "nb_annotations"> & {
  collection: CollectionModel;
  annotations: AnnotationModel[];
};

export function imageEntityToModel(item: ImageEntity): ImageModel {
  return {
    ...omit(item, ["path", "collection", "annotations", "annotations_id"]),
    nb_annotations: item.annotations_id?.length || 0,
  };
}
export function imageEntityToModelFull(item: ImageEntity): ImageModelFull {
  return {
    ...omit(item, ["collection", "collection_id", "annotations", "annotations_id"]),
    collection: collectionEntityToModel(item.collection),
    annotations: item.annotations?.map((a) => annotationEntityToModel(a)) || [],
  };
}
