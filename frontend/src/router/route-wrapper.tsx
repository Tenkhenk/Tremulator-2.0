import React, { useState, useEffect } from "react";
import { useReactOidc } from "@axa-fr/react-oidc-context";
import Loader from "../components/loader";

interface Props {
  secured?: boolean;
}

export const RouteWrapper: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
  const { secured, children } = props;
  const { oidcUser, login } = useReactOidc();

  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    if ((secured && oidcUser) || !secured) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }
  }, [secured, oidcUser]);

  useEffect(() => {
    if (allowed === false) login();
  }, [allowed, login]);

  if (allowed) return <>{children}</>;
  else return <Loader />;
};
