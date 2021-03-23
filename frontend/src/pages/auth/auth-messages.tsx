import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import React, { useContext, useEffect } from "react";
import Loader from "../../components/loader";
import { AppContext } from "../../context/app-context";

export const Authenticating: React.FC = () => {
  const { oidcUser } = useContext(AuthenticationContext);

  return (
    <>
      {!oidcUser && (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <h2>Authenticating</h2>
            </div>
            <div className="col-12">
              <Loader />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Authenticated: React.FC = () => {
  const { setAlertMessage } = useContext(AppContext);
  useEffect(() => {
    setAlertMessage({ message: "Authentication success. Welcome in Tremulator!", type: "success" });
  }, [setAlertMessage]);
  return null;
};

export const NotAuthenticated: React.FC = () => {
  const { login } = useContext(AuthenticationContext);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h2>You are not authenticated.</h2>
        </div>
        <div className="col-12">
          Please{" "}
          <button className="btn btn-primary" onClick={() => login()}>
            login
          </button>
        </div>
      </div>
    </div>
  );
};

export const SessionLost: React.FC = () => {
  const { login } = useContext(AuthenticationContext);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h2>Your session has expired</h2>
        </div>
        <div className="col-12">
          Please{" "}
          <button className="btn btn-primary" onClick={() => login()}>
            login
          </button>
        </div>
      </div>
    </div>
  );
};
