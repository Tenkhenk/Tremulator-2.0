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
import { SchemaEntity } from "./schema";
import { ImageEntity } from "./image";
import { UserEntity } from "./user";

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
  @JoinTable()
  users: Array<UserEntity>;

  @OneToMany(() => ImageEntity, (image) => image.collection)
  images: Array<ImageEntity>;

  @OneToMany(() => SchemaEntity, (schema) => schema.collection)
  schemas: Array<SchemaEntity>;
}

export type CollectionModel = Pick<CollectionEntity, "id" | "name" | "description">;
