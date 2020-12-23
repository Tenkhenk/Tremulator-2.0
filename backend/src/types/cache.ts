import { User } from "./authentification";

export interface CacheItem {
  data: User;
  expires_in: number; // in second
  created_at: number; //in second
}
