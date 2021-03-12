import { PageHome } from "../pages/home";
import { CollectionListPage } from "../pages/collection-list";
import { CollectionNew } from "../pages/collection-new";
import { CollectionEdit } from "../pages/collection-edit";
import { Collection } from "../pages/collection";
import { CollectionImage } from "../pages/collection-image";
import { AnnotationSchemaEdit } from "../pages/annotation-schema-edit";
import { AnnotationSchemaNew } from "../pages/annotation-schema-new";

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
        component: CollectionListPage,
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
          {
            path: "/:collectionID/schemas",
            secured: true,
            routes: [
              {
                path: "/new",
                secured: true,
                component: AnnotationSchemaNew,
              },
              {
                path: "/:schemaID/edit",
                secured: true,
                component: AnnotationSchemaEdit,
              },
              {
                path: "/:schemaID",
                secured: true,
                redirect: "/:schemaID/edit",
              },
            ],
          },
        ],
      },
    ],
  },
];
