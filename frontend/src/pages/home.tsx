import React from "react";
import { useUser } from "../hooks/user";
import { useGet, usePost } from "../hooks/api";
import { useHistory } from "react-router-dom";
import { CollectionList } from "./collection-list";
import { Link } from "react-router-dom";

interface Props {}
export const PageHome: React.FC<Props> = (props: Props) => {
  const { user } = useUser();
  const history = useHistory();
  const { data, loading, error } = useGet<string>("/misc/ping");
  const [echo, { loading: postLoading, error: postError, data: postData }] = usePost<
    { test: string },
    { test: string }
  >("/misc/echo");
  return (
    <div className="d-flex flex-column">
      <h1 className="text-left w-100">
        Tremulator v2
      </h1>
      <h4>The Tremulator is a digital Humanities tool created by Ian D. Johnson and David F. Johnson for collecting and visualizing irregular paleographical data on Medieval manuscripts.</h4>
      {!user && <div>
          <p>To create or join a collection please login using an existing Google account.</p>
          <Link to={"/collections"}>
            <button className="btn btn-primary btn-lg">
              <i className="fab fa-google"></i><span className="ml-3">Sign in with Google</span>
            </button>
          </Link>
      </div>}
      {user &&
       <CollectionList></CollectionList>}
    </div>
  );
};
