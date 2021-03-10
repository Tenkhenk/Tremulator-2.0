import { PageHome } from "../pages/home";
import { CollectionList } from "../pages/collection-list";
import { CollectionNew } from "../pages/collection-new";
import { CollectionEdit } from "../pages/collection-edit";
import { Collection } from "../pages/collection";
import { CollectionImage } from "../pages/collection-image";

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
          },
          {
            path: "/:id",
            secured: true,
            component: Collection,
          },
          {
            path: "/:collectionID/images/:imageID",
            secured: true,
            component: CollectionImage,
          },
        ],
      },
    ],
  },
];
