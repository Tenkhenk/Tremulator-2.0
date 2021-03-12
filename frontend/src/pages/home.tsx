import React, { useContext, useEffect } from "react";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { CollectionList } from "../components/collection-list";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";

interface Props {}
export const PageHome: React.FC<Props> = (props: Props) => {
  const { oidcUser } = useContext(AuthenticationContext);
  const { setCurrentCollection, setCurrentImageID } = useContext(AppContext);
  //reset context
  useEffect(() => {
    setCurrentCollection(null);
    setCurrentImageID(null);
  }, [setCurrentCollection, setCurrentImageID]);
  return (
    <div className="d-flex flex-column">
      <h1 className="text-left w-100">Tremulator v2</h1>
      <h4>
        The Tremulator is a digital Humanities tool created by Ian D. Johnson and David F. Johnson for collecting and
        visualizing irregular paleographical data on Medieval manuscripts.
      </h4>
      {!oidcUser && (
        <div>
          <p>To create or join a collection please login using an existing Google account.</p>
          <Link to={"/collections"}>
            <button className="btn btn-primary btn-lg">
              <i className="fab fa-google"></i>
              <span className="ml-3">Sign in with Google</span>
            </button>
          </Link>
        </div>
      )}
      {oidcUser && <CollectionList></CollectionList>}
    </div>
  );
};
