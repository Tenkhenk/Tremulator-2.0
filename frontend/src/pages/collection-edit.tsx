import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { usePut, useGet, useDelete } from "../hooks/api";
import { collectionSchemaForm, CollectionData, CollectionModel, CollectionModelFull } from "../types/index";
import { pick } from "lodash";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import Form from "@rjsf/bootstrap-4";
import { AppContext } from "../context/app-context";
import ModalPortal from "../components/modal";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { SchemaInline } from "../components/schema/inline";

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

  // state
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

  // actions
  const updateCollection = async (item: CollectionModel) => {
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

          <div className="row page-title">
            <div className="col">
              <h2>{collection.name}</h2>
            </div>
          </div>
          <div className="row justify-content-md-center">
            <div className="col-6">
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

          <div className="row">
            <div className="col">
              <h3>
                <i className="fas fa-list-ul"></i> {collection.schemas.length} annotations schema
                {collection.schemas.length > 1 && "s"}{" "}
                <Link className="mr-1" to={`/collections/${collection.id}/schemas/new`}>
                  <i className="far fa-plus-square" aria-label="add a picture" title="add a picture"></i>
                </Link>
              </h3>
              {collection.schemas.length > 0 && (
                <div className="d-flex flex-wrap justify-content-start">
                  {collection.schemas.map((s) => (
                    <SchemaInline key={s.id} collectionID={collection.id} schema={s} onDelete={() => fetch()} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {isOwner(collection, oidcUser) && (
            <div className="row">
              <div className="col">
                <h3>
                  <i className="fas fa-exclamation-triangle"></i> Danger Zone
                </h3>
                <p>
                  If you delete this collection all the related {collection.images.length} images and their annotations
                  will be deleted too.
                </p>
                <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(true)}>
                  Delete this collection
                </button>
              </div>
            </div>
          )}
          {needsConfirmation && (
            <ModalPortal
              title="Confirmation needed"
              icon="fa-question-circle"
              onClose={() => setNeedsConfirmation(false)}
            >
              <>
                <div className="modal-body">
                  <div className="text-center h5">
                    You are about to delete the collection "{collection.name}" and the {collection.images.length}{" "}
                    associated images?
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    <i className="fas fa-window-close"></i> Cancel
                  </button>
                  <button className="btn btn-danger" onClick={(e) => del()}>
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </>
            </ModalPortal>
          )}
        </>
      )}
    </>
  );
};
