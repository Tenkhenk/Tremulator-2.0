import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { usePut, useGet, useDelete } from "../hooks/api";
import { collectionSchemaForm, CollectionType, CollectionFullType } from "../types/index";
import { pick } from "lodash";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import Form from "@rjsf/bootstrap-4";
import { AppContext } from "../context/app-context";
import ModalPortal from "../components/modal";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";

function isOwner(collection: CollectionFullType, oidcUser: any): boolean {
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

  // state
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [collectionEdition, setCollectionEdition] = useState<CollectionType | null>(null);

  const { data: collection, loading, error } = useGet<CollectionFullType>(`/collections/${id}`);
  const [putCollection, { loading: putLoading }] = usePut<CollectionType>(`/collections/${id}`);
  const [deleteCollection, { loading: delLoading }] = useDelete<CollectionType>(`/collections/${id}`);

  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error, setAlertMessage]);

  useEffect(() => {
    setCollectionEdition(pick(collection, ["id", "name", "description"]) as CollectionType);
  }, [collection]);

  // actions
  const updateCollection = async (item: CollectionType) => {
    try {
      await putCollection(item);
      setAlertMessage({ message: `Collection saved`, type: "success" });
      history.push(`/collections/${id}/edit`);
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

          <div className="container-fluid">
            <div className=" row">
              <div className="col">
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
            </div>
          </div>

          <div>
            <div className=" row">
              <div className="col-sm-12 mt-5">
                <h3>
                  <i className="fas fa-vector-square"></i> {collection.schemas.length} annotations schema
                  {collection.schemas.length > 1 && "s"}{" "}
                  <Link className="mr-1" to={`/collections/${collection.id}/schemas/new`}>
                    <i className="far fa-plus-square" aria-label="add a picture" title="add a picture"></i>
                  </Link>
                </h3>
              </div>
            </div>
            {collection.schemas.length > 0 && (
              <div className="d-flex flex-wrap">
                {collection.schemas.map((s) => (
                  <div className="card m-2" key={s.id} style={{ borderLeft: `5px solid ${s.color}` }}>
                    <div className="card-body">
                      {s.name}{" "}
                      <Link to={`/collections/${collection.id}/schemas/${s.id}/edit`}>
                        <i className="fas fa-edit"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isOwner(collection, oidcUser) && (
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
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(true)}>
                    Delete this collection
                  </button>
                </div>
              </div>
            </div>
          )}
          {needsConfirmation && (
            <ModalPortal
              title="Confirmation needed"
              icon="fa-question-circle"
              onClose={() => setNeedsConfirmation(false)}
            >
              <div className="h5">
                <div className="text-center">
                  You are about to delete the collection
                  <br />"{collection.name}" and the {collection.images.length} associated images?
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    Cancel <i className="fas fa-window-close ml-1"></i>
                  </button>
                  <button className="btn btn-danger ml-2" onClick={(e) => del()}>
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
