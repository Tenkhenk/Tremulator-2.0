import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { usePut, useGet, useDelete } from "../hooks/api";
import {
  collectionSchemaForm,
  CollectionData,
  CollectionModel,
  CollectionModelFull,
  collectionUserForm,
} from "../types/index";
import { pick } from "lodash";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import Form from "@rjsf/bootstrap-4";
import { AppContext } from "../context/app-context";
import ModalPortal from "../components/modal";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { SchemaInline } from "../components/schema/inline";
import { CollectionUsers } from "../components/user/users";
import { AxiosError } from "axios";

function isOwner(collection: CollectionModelFull, oidcUser: any): boolean {
  return collection && oidcUser && oidcUser.profile.email === collection.owner.email;
}

interface Props {
  id: string;
}

export const CollectionEdit: React.FC<Props> = (props: Props) => {
  const { id } = props;

  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);
  const { oidcUser } = useContext(AuthenticationContext);

  // collection management
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [collectionEdition, setCollectionEdition] = useState<CollectionModel | null>(null);
  const { data: collection, loading, error, fetch } = useGet<CollectionModelFull>(`/collections/${id}`);
  const [putCollection, { loading: putLoading }] = usePut<CollectionData>(`/collections/${id}`);
  const [deleteCollection, { loading: delLoading }] = useDelete(`/collections/${id}`);

  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error, setAlertMessage]);

  useEffect(() => {
    setCollectionEdition(pick(collection, ["id", "name", "description"]) as CollectionModel);
  }, [collection]);

  // user creation
  const [createUser, setCreateUser] = useState<boolean>(false);
  const [putUser] = usePut<{ email: string }>(`/collections/${id}/users`);

  // actions
  const updateCollection = async (item: CollectionModel) => {
    try {
      await putCollection(item);
      setAlertMessage({ message: `Collection saved`, type: "success" });
      fetch();
    } catch (error) {
      setAlertMessage({ message: `Error when saving your collection "${error.message}"`, type: "warning" });
    }
  };

  const del = async () => {
    try {
      await deleteCollection();
      setAlertMessage({ message: `Collection deleted`, type: "success" });
      history.push("/collections");
    } catch (error) {
      setAlertMessage({ message: `Error when deleting your collection "${error.message}"`, type: "warning" });
    }
  };

  return (
    <>
      {(loading || putLoading || delLoading) && <Loader />}
      {collection && (
        <>
          <PageHeader title={`Collection: edit ${collection.name}`}>
            <h1>
              <Link to={`/collections/${collection.id}`}>{collection.name}</Link>
            </h1>
          </PageHeader>
          <div className="container">
            <div className="row ">
              <div className="col">
                <div className="row justify-content-md-left mt-5">
                  <div className="col-2"></div>
                  <div className="col-8">
                    <Form
                      schema={collectionSchemaForm.schema}
                      uiSchema={collectionSchemaForm.ui}
                      onChange={(e) => setCollectionEdition(e.formData)}
                      formData={collectionEdition}
                      onSubmit={(e) => updateCollection(e.formData)}
                    >
                      <div className="form-group text-right">
                        <button type="submit" className="btn btn-primary  ml-2">
                          Submit
                        </button>
                      </div>
                    </Form>
                  </div>
                  <div className="col-2"></div>
                </div>
                {/* SPACER */}
                <div className="row my-3">
                  <div className="col-2"></div>
                  <div className="col-8">
                    <hr />
                  </div>
                  <div className="col-2"></div>
                </div>
                {/* ANNOTATIONS SCHEMA */}
                <div className="row">
                  <div className="col-2"></div>
                  <div className="col-8">
                    <h3 className="text-center">
                      <i className="fas fa-list-ul"></i> {collection.schemas.length} annotations schema
                      {collection.schemas.length > 1 && "s"}{" "}
                      <Link className="mr-1" to={`/collections/${collection.id}/schemas/new`}>
                        <i className="far fa-plus-square" aria-label="add a picture" title="add a picture"></i>
                      </Link>
                    </h3>
                    {collection.schemas.length > 0 && (
                      <div className="d-flex flex-wrap justify-content-center mt-3">
                        {collection.schemas.map((s) => (
                          <SchemaInline
                            key={s.id}
                            collectionID={collection.id}
                            schema={s}
                            onDelete={() => fetch()}
                            className="align-baseline"
                          />
                        ))}
                      </div>
                    )}
                    {collection.schemas.length === 0 && (
                      <div className="text-center text-muted justify-content-center">
                        <Link className="mr-1" to={`/collections/${collection.id}/schemas/new`}>
                          Create a schema
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="col-2"></div>
                </div>
                {/* SPACER */}
                <div className="row my-3">
                  <div className="col-2"></div>
                  <div className="col-8">
                    <hr />
                  </div>
                  <div className="col-2"></div>
                </div>
                {/* USERS */}
                <div className="row">
                  <div className="col-2"></div>
                  <div className="col-8">
                    <h3 className="text-center">
                      <i className="fas fa-user"></i> {collection.users.length + 1} User
                      {collection.users.length > 0 && "s"}{" "}
                      <button className="btn btn-link mr-1" onClick={() => setCreateUser(true)}>
                        <i className="far fa-plus-square" aria-label="add a user" title="add a user"></i>
                      </button>
                    </h3>
                    <CollectionUsers collection={collection} onUpdate={fetch} />
                    {/* USER CREATION MODAL */}
                    {createUser && (
                      <ModalPortal
                        title={`Add a user to collection '${collection.name}'`}
                        icon="fa-user"
                        onClose={() => setCreateUser(false)}
                      >
                        <div className="container mt-3">
                          <Form
                            schema={collectionUserForm.schema}
                            uiSchema={collectionUserForm.ui}
                            //onChange={(e) => setCollectionEdition(e.formData)}
                            //formData={collectionEdition}
                            onSubmit={async (e) => {
                              try {
                                await putUser(e.formData);
                                setCreateUser(false);
                                fetch();
                              } catch (error) {
                                if ((error as AxiosError).response?.status === 400)
                                  setAlertMessage({
                                    message: `The user email ${e.formData.email} can't be found. The user must login in Tremulator once before one can add him/her to a collection.`,
                                    type: "warning",
                                  });
                                else
                                  setAlertMessage({
                                    message: `Error when adding the user email ${e.formData.email}: ${error?.message}`,
                                    type: "warning",
                                  });
                              }
                            }}
                          >
                            <div className="form-group text-right">
                              <button className="btn btn-primary mr-1" type="submit">
                                <i className="far fa-plus-square" aria-label="add a user" title="add a user"></i>
                                Add a user
                              </button>
                            </div>
                          </Form>
                        </div>
                      </ModalPortal>
                    )}
                  </div>
                  <div className="col-2"></div>
                </div>
                {/* DELETION */}
                {isOwner(collection, oidcUser) && (
                  <>
                    <div className="row my-3">
                      <div className="col-2"></div>
                      <div className="col-8">
                        <hr />
                      </div>
                      <div className="col-2"></div>
                    </div>

                    <div className="row text-center">
                      <div className="col-2"></div>
                      <div className="col-8">
                        <h3>
                          <i className="fas fa-exclamation-triangle"></i> Danger Zone
                        </h3>
                        {collection.images.length > 0 && (
                          <p>
                            If you delete this collection all the related {collection.images.length} images and their
                            annotations will be deleted too.
                          </p>
                        )}
                        <button className="btn btn-secondary mt-2" onClick={() => setNeedsConfirmation(true)}>
                          Delete this collection
                        </button>
                      </div>
                      <div className="col-2"></div>
                    </div>
                  </>
                )}
                {needsConfirmation && (
                  <ModalPortal
                    title="Confirmation needed"
                    icon="fa-question-circle"
                    onClose={() => setNeedsConfirmation(false)}
                  >
                    <>
                      <div className="modal-body">
                        {delLoading && <Loader />}
                        {!delLoading && (
                          <div className="text-center h5">
                            You are about to delete the collection "{collection.name}" and the{" "}
                            {collection.images.length} associated images?
                          </div>
                        )}
                      </div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                          <i className="fas fa-window-close"></i> Cancel
                        </button>
                        <button className="btn btn-danger" onClick={(e) => del()} disabled={delLoading}>
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </div>
                    </>
                  </ModalPortal>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
