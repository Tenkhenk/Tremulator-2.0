import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
