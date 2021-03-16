import React from "react";

import { useGet } from "../hooks/api";
import { CollectionType } from "../types";
import { Link } from "react-router-dom";

interface Props {}
export const CollectionList: React.FC<Props> = (props: Props) => {
  const { data, loading, error } = useGet<CollectionType[]>("/collections");
  return (
    <>
      <h2>Collections</h2>
      {loading && "loading..."}
      {error && <div>{error.message}</div>}
      {/* Collection list */}
      {!loading && !error && data && data.length > 0 && (
        <div>
          {data.map((collection) => (
            <div key={collection.id}>
              <Link to={`/collections/${collection.id}`}>{collection.name}</Link>{" "}
              <Link to={`/collections/${collection.id}/edit`} title="edit">
                <i className="fas fa-edit"></i>
              </Link>
            </div>
          ))}
        </div>
      )}
      {/* Collection creation */}
      <div>
        {!loading && !error && data && data.length === 0 && (
          <p>
            You can't access any collections yet.
            <br />
            Ask for access to a collection's owner or create your own collection
          </p>
        )}
        <Link to={"/collections/new"} title="Create a new collection" className="btn btn-primary">
          <i className="fas fa-folder-plus"></i>
          <span className="ml-3">Create a collection</span>
        </Link>
      </div>
    </>
  );
};
