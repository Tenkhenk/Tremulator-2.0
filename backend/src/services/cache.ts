import { Factory, Singleton } from "typescript-ioc";
import * as NodeCache from "node-cache";
import * as fs from "fs";
import * as path from "path";
import { getLogger, Logger } from "./logger";
import { CacheItem } from "../types/cache";

/* eslint-disable @typescript-eslint/no-use-before-define */
@Singleton
export class CacheService {
  private log: Logger = getLogger("CacheService");

  cache: NodeCache;
  storage_filename: string;

  constructor() {
    this.cache = new NodeCache();
    this.storage_filename = "cache.json";
    if (process.env.configuration) {
      this.storage_filename = "cache." + process.env.configuration + ".json";
    }
    this.log.info(`Using cache file`, this.storage_filename);
    this.load();
  }

  /**
   * ttl is in second.
   */
  set<T>(key: string, value: T, ttl = 0): void {
    this.log.info(`Adding new entry in cache`, { key, value, ttl });
    const data: CacheItem = {
      data: value,
      expires_in: ttl,
      created_at: Math.floor(Date.now() / 1000),
    };
    if (!this.cache.set(key, data, ttl)) {
      throw new Error("An error occured when saving object in cache");
    }
  }

  get<T>(key: string): T {
    this.log.info(`Searching cache entry`, key);
    const item: CacheItem = this.cache.get(key);
    this.log.debug(`Cache entry is `, item);
    if (item) {
      return item.data as T;
    } else return undefined;
  }

  remove(key: string): void {
    this.log.debug(`Deleting cache entry `, key);
    this.cache.del(key);
  }

  load(): void {
    const filePath = path.join(__dirname, "../../", this.storage_filename);
    this.log.info(`Loading cache from file`, filePath);

    if (fs.existsSync(filePath)) {
      try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(jsonData);
        for (const [key, val] of Object.entries(data)) {
          if (data.hasOwnProperty(key)) {
            // If the expires time equals, we store it as it (mainly for dev purpose)
            // it never happens in the openId protocole.
            if (val["expires_in"] === 0) {
              this.log.warn(`Loading entry with an infinite TTL `, val);
              this.cache.set(key, val, val["expires_in"]);
            } else {
              // we only reload token that are not expired
              // and we compute the new ttl
              const expire_time: number = val["created_at"] + val["expires_in"];
              const current_time: number = Math.floor(Date.now() / 1000);
              if (expire_time > current_time) {
                this.log.debug(`Loading entry`, { data: val, ttl: current_time - expire_time });
                this.cache.set(key, val, expire_time - current_time);
              } else {
                this.log.info(`Entry is expired`, { current: current_time, expire_time: expire_time, entry: val });
              }
            }
          }
        }
        return;
      } catch (e) {
        this.log.error(`An error occured when loading the cache from the file system`, e);
        throw new Error(`An error occured when loading the cache from the file system : ${e}`);
      }
    }
  }

  save(): void {
    this.log.info(`Saving the cache on file system`);
    try {
      const keys: Array<string> = this.cache.keys();
      const cachedData: { [key: string]: CacheItem } = this.cache.mget(keys);
      this.log.debug(`Cache state is `, cachedData);
      fs.writeFileSync(path.join(__dirname, "../../", this.storage_filename), JSON.stringify(cachedData));
    } catch (e) {
      this.log.error(`An error occured when saving cache on the disk`, e);
      //throw new Error(`An error occured when saving cache on the disk : ${e}`);
    }
  }
}
