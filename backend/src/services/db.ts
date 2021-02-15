import { Singleton } from "typescript-ioc";
import { createConnection, Connection, Entity, EntityTarget, getRepository, Repository } from "typeorm";
import { config } from "../config";
import { getLogger, Logger } from "./logger";
import { AnnotationEntity } from "../entities/annotation";
import { CollectionEntity } from "../entities/collection";
import { ImageEntity } from "../entities/image";
import { SchemaEntity } from "../entities/schema";
import { UserEntity } from "../entities/user";

@Singleton
export class DbService {
  // logger
  private log: Logger = getLogger("DbService");
  // Db connection
  private connection: Connection;

  async initialize(): Promise<void> {
    try {
      const connection = await createConnection({
        type: "postgres",
        entities: [AnnotationEntity, CollectionEntity, ImageEntity, SchemaEntity, UserEntity],
        ...config.db,
      });
      this.log.info("Database connection is OK");
      this.connection = connection;
    } catch (e) {
      this.log.error("Database connection failed", e);
      throw e;
    }
  }

  getRepository<T>(entity: EntityTarget<T>): Repository<T> {
    return getRepository(entity);
  }
}
