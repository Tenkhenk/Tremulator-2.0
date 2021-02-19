import { User as OIDCUser, UserManager, WebStorageStateStore } from "oidc-client";
import { config } from "../config";
import { User } from "../types";

export const manager = new UserManager({
  ...config.auth,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

/**
 * Hook to retrieve the connected user and the oidc user manager.
 */
export function useUser(): { user: User | null; manager: UserManager } {
  let user: User | null = null;
  const value = localStorage.getItem(`oidc.user:${config.auth.authority}:${config.auth.client_id}`);
  if (value) {
    const oidcUser: OIDCUser = JSON.parse(value) as OIDCUser;
    if (oidcUser.expires_at > Date.now()) {
      user = {
        email: oidcUser.profile.email || "",
        avatar: oidcUser.profile.picture || "",
        firstname: oidcUser.profile.given_name || "",
        lastname: oidcUser.profile.family_name || "",
      };
    }
  }
  return { user, manager };
}
