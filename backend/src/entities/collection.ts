import {
  BeforeRemove,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  RelationId,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { sortBy, pick, omit } from "lodash";
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => UserEntity)
  owner: UserEntity;

  @RelationId((c: CollectionEntity) => c.owner)
  owner_id: string;

  @ManyToMany(() => UserEntity, (user) => user.collections)
  users: Array<UserEntity>;

  @RelationId((c: CollectionEntity) => c.users)
  users_id: string[];

  @OneToMany(() => ImageEntity, (image) => image.collection, { cascade: true, onDelete: "CASCADE" })
  images: Array<ImageEntity>;

  @RelationId((c: CollectionEntity) => c.images)
  images_id: number[];

  @OneToMany(() => SchemaEntity, (schema) => schema.collection, { cascade: true, onDelete: "CASCADE" })
  schemas: Array<SchemaEntity>;

  @RelationId((c: CollectionEntity) => c.schemas)
  schemas_id: number[];

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

// For forms
export type CollectionData = Pick<CollectionEntity, "name" | "description">;
// Just the table properties with forgein keys
export type CollectionModel = Pick<
  CollectionEntity,
  "id" | "created_at" | "updated_at" | "name" | "description" | "owner_id"
> & {
  nb_users: number;
  nb_images: number;
  nb_schemas: number;
};
// Full
export type CollectionModelFull = Omit<CollectionModel, "owner_id" | "nb_users" | "nb_images" | "nb_schemas"> & {
  owner: UserModel;
  users: Array<UserModel>;
  images: Array<ImageModel>;
  schemas: Array<SchemaModel>;
};

export function collectionEntityToModel(item: CollectionEntity): CollectionModel {
  return {
    ...omit(item, ["owner", "users", "users_id", "images", "images_id", "schemas", "schemas_id"]),
    nb_users: item.users_id?.length || 0,
    nb_images: item.images_id?.length || 0,
    nb_schemas: item.schemas_id?.length || 0,
  };
}

export function collectionEntityToModelFull(item: CollectionEntity, sortField = "order"): CollectionModelFull {
  return {
    ...omit(item, ["owner", "owner_id", "users", "users_id", "images", "images_id", "schemas", "schemas_id"]),
    owner: userEntityToModel(item.owner),
    users: item.users?.map((u) => userEntityToModel(u)),
    images: sortBy(item.images, [sortField]).map((i) => imageEntityToModel(i)) || [],
    schemas: item.schemas?.map((s) => schemaEntityToModel(s)) || [],
  };
}
