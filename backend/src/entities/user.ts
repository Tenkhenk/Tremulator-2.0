import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { IsEmail, IsDate } from "class-validator";
import { pick } from "lodash";
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

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  @IsDate()
  expires_at: Date;

  @ManyToMany(() => CollectionEntity, (collection) => collection.users)
  @JoinTable()
  collections: Array<CollectionEntity>;
}

/**
 * Object summary
 */
export type UserModel = Pick<UserEntity, "email" | "firstname" | "lastname" | "avatar">;
export function userEntityToModel(user: UserEntity): UserModel {
  return pick(user, ["email", "firstname", "lastname", "avatar"]);
}
/**
 * Object full
 */
export type UserModelFull = Pick<
  UserEntity,
  "email" | "firstname" | "lastname" | "avatar" | "access_token" | "expires_at"
>;
export function userEntityToModelFull(user: UserEntity): UserModelFull {
  return pick(user, ["email", "firstname", "lastname", "avatar", "access_token", "expires_at"]);
}
