import React from "react";
import { Link } from "react-router-dom";
import { useGet } from "../hooks/api";
import { CollectionModel } from "../types";
import { Collection } from "./collection";

interface Props {}
export const CollectionList: React.FC<Props> = (props: Props) => {
  const { data, loading, error, fetch } = useGet<CollectionModel[]>("/collections");
  return (
    <>
      <div className="row page-title">
        <div className="col">
          <h2>Collections</h2>
          <Link to={"/collections/new"} title="Create a new collection">
            <i className="far fa-plus-square"></i>
          </Link>
        </div>
      </div>
      {loading && "loading..."}
      {error && <div>{error.message}</div>}
      {/* Collection list */}
      {!loading && !error && data && data.length > 0 && (
        <div className="row">
          <div className="col">
            <div className="gallery">
              {data.map((collection) => (
                <Collection
                  key={collection.id}
                  collection={collection}
                  onDelete={() => {
                    fetch();
                  }}
                />
              ))}
            </div>
          </div>
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
      </div>
    </>
  );
};
