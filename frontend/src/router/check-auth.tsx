import React, { useState, useEffect } from "react";
import { useReactOidc } from "@axa-fr/react-oidc-context";

interface Props {
  secured?: boolean;
}

export const CheckAuth: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
  const { secured, children } = props;
  const { oidcUser, login } = useReactOidc();

  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    if ((secured && oidcUser) || !secured) {
      setAllowed(true);
    } else {
      setAllowed(false);
      login();
    }
  }, [secured, oidcUser, login]);

  if (allowed) return <>{children}</>;
  else return <></>;
};
