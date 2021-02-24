import { PageHome } from "../pages/home";
import { PageLogout } from "../pages/auth/logout";
import { PageAuthCallback } from "../pages/auth/callback";
import { CollectionList } from "../pages/collection-list";
import { CollectionNew } from "../pages/collection-new";
import { CollectionEdit } from "../pages/collection-edit";

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
            path: "/callback",
            redirect: "/authentication/callback"
          },
        ],
      },
      {
        path: "/collections",
        secured: true,
        component: CollectionList,
        routes: [
          {
            path: "/new",
            secured: true,
            component: CollectionNew,
          },
          {
            path: "/:id/edit",
            secured: true,
            component: CollectionEdit,
          }
        ],
      },
    ],
  },
];
