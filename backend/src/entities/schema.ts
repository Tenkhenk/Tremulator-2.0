import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { JSONSchema7 } from "json-schema";
import { CollectionEntity } from "./collection";
import { AnnotationEntity } from "./annotation";

@Entity("schema")
export class SchemaEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: "json" })
  schema: JSONSchema7;

  @ManyToOne(() => CollectionEntity, (collection) => collection.schemas)
  collection: CollectionEntity;

  @OneToMany(() => AnnotationEntity, (annotation) => annotation.schema, { onDelete: "CASCADE" })
  annotations: Array<AnnotationEntity>;
}

export type SchemaModel = Pick<SchemaEntity, "id" | "name"> & { schema: any };
