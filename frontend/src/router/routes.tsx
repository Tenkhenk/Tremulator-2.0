import { PageHome } from "../pages/home";
import { PagePrivate } from "../pages/private";
import { PageLogout } from "../pages/auth/logout";
import { PageAuthCallback } from "../pages/auth/callback";

// Definition of a route
export interface RouteDefinition {
  path: string;
  redirect?: string;
  component?: any;
  exact?: boolean;
  routes?: RouteDefinition[];
  secured?: boolean;
}

export const routes: RouteDefinition[] = [
  {
    path: "",
    redirect: "/",
    routes: [
      {
        path: "/",
        component: PageHome,
      },
      {
        path: "/auth",
        redirect: "/callback",
        routes: [
          {
            path: "/logout",
            component: PageLogout,
          },
          {
            path: "/callback",
            component: PageAuthCallback,
          },
        ],
      },
      {
        path: "/private",
        secured: true,
        component: PagePrivate,
      },
    ],
  },
];
