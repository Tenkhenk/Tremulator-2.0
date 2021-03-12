import React, { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { usePost } from "../hooks/api";
import { CollectionType, NewCollectionType } from "../types/index";
import { Collection } from "./collection";

interface Props {}

export const CollectionNew: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);
  const [newCollection, setCollection] = useState<CollectionType | NewCollectionType>({ name: "", description: "" });
  const [postCollection, { loading }] = usePost<NewCollectionType, CollectionType>("/collections");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // create a new collection
    if (newCollection.name !== "") {
      try {
        const createdCollection = await postCollection(newCollection);
        setAlertMessage({ message: `Collection "${createdCollection.name}" created`, type: "success" });
        history.push(`/collections/${createdCollection.id}/edit`);
      } catch (error) {
        setAlertMessage({ message: `Error when creating collection "${error.message}" created`, type: "success" });
      }
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="fromGroup row">
        <label htmlFor="name" className="col-sm-2 col-form-label">
          Name
        </label>
        <div className="col-sm-6">
          <input
            className="form-control"
            value={newCollection.name}
            type="text"
            id="name"
            onChange={(e) => setCollection({ ...newCollection, name: e.target.value })}
          />
        </div>
      </div>
      <div className="fromGroup row">
        <label htmlFor="description" className="col-sm-2 col-form-label">
          Description
        </label>
        <div className="col-sm-6">
          <textarea
            className="form-control"
            id="description"
            value={newCollection.description}
            onChange={(e) => setCollection({ ...newCollection, description: e.target.value })}
          />
        </div>
      </div>
      <div className="fromGroup row">
        <div className="col-sm-8">
          <button className="btn btn-primary col-sm-2" type="submit" disabled={newCollection.name === ""}>
            {loading ? "loading..." : "create"}
          </button>
        </div>
      </div>
    </form>
  );
};
