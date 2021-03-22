import React, { FC, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CollectionModel } from "../types";
import ModalPortal from "./modal";
import { useDelete } from "../hooks/api";
import { AppContext } from "../context/app-context";
import Loader from "./loader";

interface Props {
  collection: CollectionModel;
  className?: string;
  onDelete?: () => void;
}
export const Collection: FC<Props> = (props: Props) => {
  const { collection, className, onDelete } = props;

  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const { setAlertMessage } = useContext(AppContext);
  const [remove, { loading }] = useDelete<CollectionModel>(`/collections/${collection.id}`);

  return (
    <>
      <div className={`card-gallery ${className || ""}`}>
        <div className="card-pictos">
          <span>
            <i className="fas fa-image"></i> {collection.nb_images}
          </span>
          <span>
            <i className="fas fa-list-ul"></i> {collection.nb_schemas}
          </span>
          <span>
            <i className="fas fa-user"></i> {collection.nb_users}
          </span>
        </div>
        <Link title={`${collection.description}`} to={`/collections/${collection.id}`}>
          <div className="card-body">{collection.name}</div>
        </Link>
        <div className="card-actions">
          <Link title={`Edit ${collection.name}`} to={`/collections/${collection.id}/edit`}>
            <i className="fas fa-edit"></i>
          </Link>
          <button
            title="delete"
            className="btn btn-link"
            onClick={(e) => {
              e.preventDefault();
              setDeleteConfirmation(true);
            }}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      {deleteConfirmation && (
        <ModalPortal title="Confirmation needed" icon="fa-question-circle" onClose={() => setDeleteConfirmation(false)}>
          <>
            <div className="modal-body">
              {loading && <Loader />}
              {!loading && (
                <div className="text-center h5">
                  You are about to delete the collection "{collection.name}" and its associated images (
                  {collection.nb_images}).
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
                <i className="fas fa-window-close"></i>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={loading}
                onClick={async (e) => {
                  try {
                    await remove();
                    setAlertMessage({ message: `Collection deleted`, type: "success" });
                  } catch (error) {
                    setAlertMessage({
                      message: `Error when deleting collection "${error?.message}"`,
                      type: "warning",
                    });
                  } finally {
                    if (onDelete) onDelete();
                    setDeleteConfirmation(false);
                  }
                }}
              >
                <i className={`fas fa-trash-alt`}></i>
                Delete
              </button>
            </div>
          </>
        </ModalPortal>
      )}
    </>
  );
};
