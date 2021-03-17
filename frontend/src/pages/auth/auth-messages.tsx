import React, { useContext, useEffect } from "react";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { AppContext } from "../../context/app-context";

export const Authenticating: React.FC = () => {
  const { setAlertMessage } = useContext(AppContext);
  const { oidcUser } = useContext(AuthenticationContext);

  useEffect(() => {
    if (!oidcUser) {
      setAlertMessage({ message: "You are about to be redirected to Google© Authentication form.", type: "success" });
    }
  }, [setAlertMessage, oidcUser]);
  return null;
};

export const Authenticated: React.FC = () => {
  const { setAlertMessage } = useContext(AppContext);
  useEffect(() => {
    setAlertMessage({ message: "Authentication success. Welcome in Tremulator!", type: "success" });
  }, [setAlertMessage]);
  return null;
};

export const NotAuthenticated: React.FC = () => {
  const { setAlertMessage } = useContext(AppContext);
  useEffect(() => {
    setAlertMessage({ message: "Authentication failed!", type: "warning" });
  }, [setAlertMessage]);
  return null;
};

export const SessionLost: React.FC = () => {
  const { setAlertMessage } = useContext(AppContext);
  useEffect(() => {
    setAlertMessage({ message: "Your session has expired. Please login.", type: "warning" });
  }, [setAlertMessage]);
  return null;
};
