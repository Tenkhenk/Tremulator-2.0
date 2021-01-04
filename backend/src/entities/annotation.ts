import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Image } from "./image";
import { Schema } from "./schema";

@Entity()
export class Annotation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  @ManyToOne(() => Image, (image) => image.annotations)
  image: Image;

  @ManyToOne(() => Schema)
  schema: Schema;
}
