import React, { useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import { AuthenticationContext} from "@axa-fr/react-oidc-context";

interface Props {}
export const PageLogout: React.FC<Props> = (props: Props) => {
  const {userManager} = useContext(AuthenticationContext);
  userManager.removeUser();
  return <Redirect to={"/"}></Redirect>;
};
