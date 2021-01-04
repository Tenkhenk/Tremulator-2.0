import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Annotation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
