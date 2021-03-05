import {
  BeforeRemove,
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
import * as fs from "fs";
import { config } from "../config";
import { schemaEntityToModel, SchemaEntity, SchemaModel } from "./schema";
import { imageEntityToModel, ImageEntity, ImageModel } from "./image";
import { userEntityToModel, UserEntity, UserModel } from "./user";
import { getLogger, Logger } from "../services/logger";

// logger
const log: Logger = getLogger("collection");

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

  @OneToMany(() => ImageEntity, (image) => image.collection, { cascade: true, onDelete: "CASCADE" })
  images: Array<ImageEntity>;

  @OneToMany(() => SchemaEntity, (schema) => schema.collection, { cascade: true, onDelete: "CASCADE" })
  schemas: Array<SchemaEntity>;

  @BeforeRemove()
  removeCollectionDirectory() {
    try {
      fs.rmdirSync(`${config.data.path}/${this.id}`, { recursive: true });
    } catch (e) {
      // silent exception, we just log it
      log.error("Failed to delete collection folder", e);
    }
  }
}

/**
 * Object model: just the table properties
 */
export type CollectionModel = Pick<CollectionEntity, "id" | "name" | "description">;
// Usefull type for creation
export type CollectionModelWithoutId = Omit<CollectionModel, "id">;
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
    images: item.images?.sort((a, b) => (b.order || b.id) - (a.order || a.id)).map((i) => imageEntityToModel(i)) || [],
    schemas: item.schemas?.map((s) => schemaEntityToModel(s)) || [],
  };
}
