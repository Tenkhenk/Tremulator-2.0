import { AfterRemove, BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { IsNotEmpty, IsUrl } from "class-validator";
import { pick } from "lodash";
import * as fs from "fs";
import { collectionEntityToModel, CollectionEntity, CollectionModel } from "./collection";
import { annotationEntityToModel, AnnotationEntity, AnnotationModel } from "./annotation";

@Entity("image")
export class ImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: false })
  @IsUrl()
  url: string;

  @Column({ nullable: true })
  path: string;

  @ManyToOne(() => CollectionEntity, (collection) => collection.images, { onDelete: "CASCADE" })
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.image)
  annotations: Array<AnnotationEntity>;

  @AfterRemove()
  removeFile() {
    try {
      fs.unlinkSync(this.path);
    } catch (e) {
      // silent exception
    }
  }
}

/**
 * Object model: just the table properties
 */
export type ImageModel = Pick<ImageEntity, "id" | "name" | "url">;
export function imageEntityToModel(item: ImageEntity): ImageModel {
  return pick(item, ["id", "name", "url"]);
}

/**
 * Object full
 */
export type ImageModelFull = ImageModel & {
  collection: CollectionModel;
  annotations: Array<AnnotationModel>;
};
export function imageEntityToModelFull(item: ImageEntity): ImageModelFull {
  return {
    ...pick(item, ["id", "name", "url"]),
    collection: collectionEntityToModel(item.collection),
    annotations: item.annotations?.map((a) => annotationEntityToModel(a)) || [],
  };
}
