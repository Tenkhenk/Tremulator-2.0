import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { RouteDefinition } from "./routes";
import { RouteWrapper } from "./route-wrapper";

interface Props {
  path?: string;
  routes: RouteDefinition[];
}

/**
 * Function that flatten tree routes recursively.
 */
const flattenRoutes = (path: string = "", routes: RouteDefinition[] = []): Array<RouteDefinition> => {
  // The result
  let routesList: Array<RouteDefinition> = [];
  routes.forEach((route: RouteDefinition) => {
    // construct the route definition
    const currentRoute: RouteDefinition = {
      path: `${path}${route.path}`,
      secured: route.secured === true,
    };
    if (route.redirect) {
      currentRoute.redirect = route.redirect;
    }
    if (route.component) {
      currentRoute.component = route.component;
    }
    if (route.exact) {
      currentRoute.exact = route.exact;
    }
    // recursivity
    if (route.routes) {
      routesList = routesList.concat(flattenRoutes(currentRoute.path, route.routes));
    }
    routesList.push(currentRoute);
  });
  return routesList;
};

/**
 * Component that do the routing system
 */
export const RouterWrapper: React.FC<Props> = (props: Props) => {
  const routesFlatten = flattenRoutes(props.path, props.routes);

  if (routesFlatten.length > 0)
    return (
      <Switch>
        {routesFlatten.map((route: RouteDefinition) => {
          if (route.redirect) {
            return <Redirect key={route.path} exact={route.exact || true} path={route.path} to={route.redirect} />;
          } else {
            return (
              <Route
                key={route.path}
                path={route.path}
                exact={route.exact || true}
                render={(props) => {
                  return (
                    <RouteWrapper secured={route.secured}>
                      <route.component {...props.match.params} />
                    </RouteWrapper>
                  );
                }}
              />
            );
          }
        })}
      </Switch>
    );
  else return null;
};
