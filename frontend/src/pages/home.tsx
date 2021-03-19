import React, { useContext, useEffect } from "react";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { CollectionList } from "../components/collection-list";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";

interface Props {}
export const PageHome: React.FC<Props> = (props: Props) => {
  const { oidcUser } = useContext(AuthenticationContext);
  return (
    <>
      <div className="row">
        <div className="col">
          <h1>Tremulator v2</h1>
          <span>
            The Tremulator is a digital Humanities tool created by Ian D. Johnson and David F. Johnson for collecting
            and visualizing irregular paleographical data on Medieval manuscripts.
          </span>
        </div>
      </div>
      {!oidcUser && (
        <div className="row">
          <div className="col">
            <p>To create or join a collection please login using an existing Google account.</p>
            <Link to={"/collections"} title="Sign in with Google" className="btn btn-primary btn-lg">
              <i className="fab fa-google"></i>
              <span className="ml-3">Sign in with Google</span>
            </Link>
          </div>
        </div>
      )}
      {oidcUser && (
        <div className="row">
          <div className="col">
            <CollectionList></CollectionList>
          </div>
        </div>
      )}
    </>
  );
};
