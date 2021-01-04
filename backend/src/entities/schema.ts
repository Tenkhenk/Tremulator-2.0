import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Schema extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
