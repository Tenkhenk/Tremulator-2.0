import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Collection } from "./collection";

@Entity()
export class User extends BaseEntity {
  @Column({ primary: true })
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  avatar: string;

  @Column()
  access_token: string;

  @Column()
  expires_at: Date;

  @ManyToMany(() => Collection)
  @JoinTable()
  collections: Array<Collection>;
}
