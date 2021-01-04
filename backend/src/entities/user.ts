import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
