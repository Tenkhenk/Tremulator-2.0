import React from "react";
import { useUser } from "../hooks/user";
import { useGet } from "../hooks/api";
import { components } from "../types/api";
import { Link } from "react-router-dom";

interface Props {}
export const CollectionList: React.FC<Props> = (props: Props) => {
  const { user } = useUser();
  const { data, loading, error } = useGet<components['schemas']['CollectionModel'][]>("/collections");
  return (
    <>
      {loading && "loading"}
      {error && <div>{error}</div>}
      {/* Collection list */}
      {!loading && !error && data && data.length > 0 &&
        <div>  
            {data.map(collection => (
              <div>collection.name</div>
            ))}
        </div>}
      {/* First collection creation */}
      {!loading && !error && data && data.length === 0 &&
        <div>
          <p>You can't access any collections yet.<br/>Ask for access to a collection's owner or create your own collection</p>
          <Link to={"/collections/new"}><button className="btn btn-primary btn"><i className="fas fa-folder-plus"></i><span className="ml-3">Create a collection</span></button></Link>
        </div>
      }
    </>
  );
};
