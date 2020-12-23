import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { userManager } from "../hooks/user";

interface Props {
  secured: boolean;
}

export const AuthProvider: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
  const { secured, children } = props;
  const location = useLocation();

  // On mount we check if the route is secured
  // if so and user is not logged we do the auth process
  useEffect(() => {
    const main = async () => {
      if (secured) {
        const user = await userManager.getUser();
        if (!user || user.expired) {
          localStorage.setItem("AUTH_REDIRECT_URL", `${location.pathname}${location.search}`);
          userManager.signinRedirect();
        }
      }
    };
    main();
  }, [secured, location.pathname, location.search]);
  return <>{children}</>;
};
