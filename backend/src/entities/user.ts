import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { IsEmail, IsDate } from "class-validator";
import { CollectionEntity } from "./collection";

@Entity("user")
export class UserEntity extends BaseEntity {
  @IsEmail()
  @Column({ primary: true })
  email: string;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  access_token: string;

  @Column()
  @IsDate()
  expires_at: Date;

  @ManyToMany(() => CollectionEntity)
  @JoinTable()
  collections: Array<CollectionEntity>;
}

export type UserModel = Pick<UserEntity, "email" | "firstname" | "lastname" | "avatar" | "access_token" | "expires_at">;
