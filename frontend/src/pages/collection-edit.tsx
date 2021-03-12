import React, { FormEvent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { usePut, useGet, useDelete } from "../hooks/api";
import { CollectionType, CollectionFullType, SchemaType } from "../types/index";
import { omit } from "lodash";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { AppContext } from "../context/app-context";
import ModalPortal from "../components/modal";
import { AnnotationSchemaCreationForm, AnnotationSchemaEditionForm } from "../components/annotation-schema-form";

interface Props {
  id: string;
}

export const CollectionEdit: React.FC<Props> = (props: Props) => {
  // state management
  const { id } = props;
  const history = useHistory();
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [createSchema, setCreateSchema] = useState<boolean>(false);
  const [editSchema, setEditSchema] = useState<SchemaType | null>(null);
  const { setAlertMessage, currentCollection: collection, setCurrentCollection: setCollection } = useContext(
    AppContext,
  );
  const { oidcUser } = useContext(AuthenticationContext);
  const { data: getCollection, loading: getLoading, error: getError } = useGet<CollectionFullType>(
    `/collections/${id}`,
  );
  const [putCollection, { loading: putLoading }] = usePut<CollectionType>(`/collections/${id}`);

  const [deleteCollection] = useDelete<CollectionType>(`/collections/${id}`);

  // initialize collection
  useEffect(() => {
    if (getCollection) {
      setCollection(getCollection);
    }
  }, [getCollection, setCollection]);

  // actions
  const updateCollection = async (e: FormEvent) => {
    e.preventDefault();

    // modify an existing collection
    if (collection && collection.name !== "") {
      try {
        await putCollection(omit(getCollection, ["schemas", "images", "users", "owner"]) as CollectionType);
        setAlertMessage({ message: `Collection saved`, type: "success" });
      } catch (error) {
        setAlertMessage({ message: `Error when saving your collection "${error.message}"`, type: "warning" });
      }
    }
  };
  const del = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await deleteCollection();
      setAlertMessage({ message: `Collection deleted`, type: "success" });
      history.push("/collections");
    } catch (error) {
      setAlertMessage({ message: `Error when deleting your collection "${error.message}"`, type: "warning" });
    }
  };

  const isOwner = getCollection && oidcUser && oidcUser.profile.email === getCollection.owner.email;

  return (
    <>
      {getError && getError.message}
      {getLoading && "loading collection..."}
      {!getError && collection && (
        <>
          <h1>{collection.name}</h1>
          <div>
            <div className=" row">
              <label htmlFor="name" className="col-sm-2 col-form-label">
                Name
              </label>
              <div className="col-sm-6">
                <input
                  className="form-control"
                  value={collection.name}
                  type="text"
                  id="name"
                  onChange={(e) => setCollection({ ...collection, name: e.target.value })}
                />
              </div>
            </div>
            <div className=" row">
              <label htmlFor="name" className="col-sm-2 col-form-label">
                Description
              </label>
              <div className="col-sm-6">
                <textarea
                  className="form-control"
                  id="description"
                  value={collection.description}
                  onChange={(e) => setCollection({ ...collection, description: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className=" row">
              <div className="col-sm-8">
                <button
                  className="btn btn-primary col-sm-2"
                  onClick={(e) => updateCollection(e)}
                  disabled={collection.name === ""}
                >
                  {putLoading ? "loading..." : "save"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className=" row">
              <div className="col-sm-12 mt-5">
                <h3>
                  <i className="fas fa-vector-square"></i> Annotations schema
                </h3>
              </div>
            </div>
            {collection.schemas.length > 0 && (
              <div className=" row">
                {collection.schemas.map((s) => (
                  <div key={s.id} className="col-8">
                    <h4 className="accordion-header" id="headingOne">
                      <button
                        className={`btn w-100 mt-1 ${
                          !editSchema || editSchema.id !== s.id ? "btn-secondary" : "btn-primary"
                        }`}
                        onClick={() => setEditSchema((olds) => (olds && olds.id === s.id ? null : s))}
                        type="button"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                      >
                        {s.name}
                      </button>
                    </h4>
                    <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne">
                      <div className="accordion-body">
                        {editSchema && editSchema.id === s.id && (
                          <AnnotationSchemaEditionForm
                            schema={editSchema}
                            collection={collection}
                            onSaved={(updatedSchema) => {
                              //close modal
                              setEditSchema(null);
                              setCollection({
                                ...collection,
                                // replace schema by the updated one
                                schemas: collection.schemas.map((s) => (s.id === updatedSchema.id ? updatedSchema : s)),
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" onClick={() => setCreateSchema(true)}>
              Create
            </button>

            {createSchema && (
              <ModalPortal title="Edit Schema" onClose={() => setCreateSchema(false)}>
                <AnnotationSchemaCreationForm
                  collection={collection}
                  onSaved={(createdSchema) => {
                    //close modal
                    setCreateSchema(false);
                    setCollection({
                      ...collection,
                      // add created schema
                      schemas: collection.schemas.concat(createdSchema),
                    });
                  }}
                />
              </ModalPortal>
            )}
          </div>
          {isOwner && (
            <div>
              <div className=" row">
                <div className="col-sm-12 mt-5">
                  <h3>
                    <i className="fas fa-exclamation-triangle"></i> Danger Zone
                  </h3>
                  <p>
                    If you delete this collection all the related {collection.images.length} images and their
                    annotations will be deleted too.
                  </p>
                </div>
              </div>
              <div className=" row">
                <div className="col-sm-12">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setNeedsConfirmation(true)}
                    disabled={collection.id === -1}
                  >
                    {putLoading ? "loading..." : "delete this collection"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {needsConfirmation && (
            <ModalPortal title="Confirmation needed" onClose={() => setNeedsConfirmation(false)}>
              <div className="h5">
                <div className="text-center">
                  <i className="far fa-question-circle fa-2x mb-3"></i>
                  <br />
                  You are about to delete the collection
                  <br />"{collection.name}" and the {collection.images.length} associated images?
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    Cancel <i className="fas fa-window-close ml-1"></i>
                  </button>
                  <button className="btn btn-danger ml-2" onClick={(e) => del(e)}>
                    <i className="fas fa-trash-alt mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </ModalPortal>
          )}
        </>
      )}
    </>
  );
};
