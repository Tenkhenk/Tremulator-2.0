import { User as OIDCUser, UserManager, WebStorageStateStore } from "oidc-client";
import { config } from "../config";

export class User {
  email?: string;
  name?: string;
  avatar?: string;
  firstname?: string;
  lastname?: string;
  locale?: string;
}

export const userManager = new UserManager({
  ...config.auth,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

/**
 * Hook to manage connected user.
 */
export function useUser(): [User | null, (user: User) => void] {
  /**
   * Retrieve the connected user.
   */
  function getUser(): User | null {
    let result: User | null = null;
    const value = localStorage.getItem(`oidc.user:${config.auth.authority}:${config.auth.client_id}`);
    if (value) {
      const oidcUser: OIDCUser = JSON.parse(value) as OIDCUser;
      result = {
        email: oidcUser.profile.email,
        name: oidcUser.profile.name,
        avatar: oidcUser.profile.picture,
        firstname: oidcUser.profile.given_name,
        lastname: oidcUser.profile.family_name,
        locale: oidcUser.profile.locale,
      };
    }
    return result;
  }

  /**
   * Connect the user
   */
  function setUser(user: User): void {}

  return [getUser(), setUser];
}
