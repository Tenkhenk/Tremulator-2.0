import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { pick } from "lodash";
import { schemaEntityToModel, SchemaEntity, SchemaModel } from "./schema";
import { imageEntityToModel, ImageEntity, ImageModel } from "./image";
import { userEntityToModel, UserEntity, UserModel } from "./user";

@Entity("collection")
export class CollectionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => UserEntity)
  owner: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.collections)
  users: Array<UserEntity>;

  @OneToMany(() => ImageEntity, (image) => image.collection, { onDelete: "CASCADE" })
  images: Array<ImageEntity>;

  @OneToMany(() => SchemaEntity, (schema) => schema.collection, { onDelete: "CASCADE" })
  schemas: Array<SchemaEntity>;
}

/**
 * Object model: just the table properties
 */
export type CollectionModel = Pick<CollectionEntity, "id" | "name" | "description">;
export function collectionEntityToModel(item: CollectionEntity): CollectionModel {
  return pick(item, ["id", "name", "description"]);
}

/**
 * Object full
 */
export type CollectionModelFull = Pick<CollectionEntity, "id" | "name" | "description"> & {
  owner: UserModel;
  users: Array<UserModel>;
  images: Array<ImageModel>;
  schemas: Array<SchemaModel>;
};
export function collectionEntityToModelFull(item: CollectionEntity): CollectionModelFull {
  return {
    ...pick(item, ["id", "name", "description"]),
    owner: userEntityToModel(item.owner),
    users: item.users?.map((u) => userEntityToModel(u)),
    images: item.images?.map((i) => imageEntityToModel(i)) || [],
    schemas: item.schemas?.map((s) => schemaEntityToModel(s)) || [],
  };
}
