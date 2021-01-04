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
import { Schema } from "./schema";
import { Image } from "./image";
import { User } from "./user";

@Entity()
export class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User)
  owner: User;

  @ManyToMany(() => User, (user) => user.collections)
  @JoinTable()
  users: Array<User>;

  @OneToMany(() => Image, (image) => image.collection)
  images: Array<Image>;

  @OneToMany(() => Schema, (schema) => schema.collection)
  schemas: Array<Schema>;
}
