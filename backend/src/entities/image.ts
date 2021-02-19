import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { IsNotEmpty, IsUrl } from "class-validator";
import { CollectionEntity } from "./collection";
import { AnnotationEntity } from "./annotation";

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

  @ManyToOne(() => CollectionEntity, (collection) => collection.images)
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.image)
  annotations: Array<AnnotationEntity>;
}

export type ImageModel = Pick<ImageEntity, "id" | "name" | "url">;
