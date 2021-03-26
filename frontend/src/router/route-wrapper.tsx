import React, { useState, useEffect } from "react";
import { useReactOidc, OidcSecure } from "@axa-fr/react-oidc-context";

interface Props {
  secured?: boolean;
}

export const RouteWrapper: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {
  const { secured, children } = props;
  const { oidcUser, login } = useReactOidc();

  const [allowed, setAllowed] = useState<boolean>(true);

  useEffect(() => {
    if (secured === true && !oidcUser) {
      setAllowed(false);
    } else {
      setAllowed(true);
    }
  }, [secured, oidcUser, login]);

  if (allowed === false) {
    return (
      <OidcSecure>
        <>{children}</>
      </OidcSecure>
    );
  } else {
    return <>{children}</>;
  }
};
