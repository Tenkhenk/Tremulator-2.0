import React, { FC, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { SchemaModel } from "../../types";
import ModalPortal from "../modal";
import { useDelete } from "../../hooks/api";
import { AppContext } from "../../context/app-context";

interface Props {
  collectionID: number;
  schema: SchemaModel;
  className?: string;
  onClick?: () => void;
  onDelete?: () => void;
}
export const SchemaInline: FC<Props> = (props: Props) => {
  const { collectionID, schema, className, onClick, onDelete } = props;

  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const { setAlertMessage } = useContext(AppContext);
  const [remove, { loading }] = useDelete<SchemaModel>(`/collections/${collectionID}/schema/${schema.id}`);

  return (
    <>
      <div
        className={`schema-card ${className ? className : ""}`}
        style={{ borderColor: `${schema.color}` }}
        onClick={() => {
          if (onClick) onClick();
        }}
      >
        <div className="schema-card-body">{schema.name}</div>

        <div className="schema-card-action">
          <Link title={`Edit schema "${schema.name}"`} to={`/collections/${collectionID}/schemas/${schema.id}/edit`}>
            <i className="fas fa-edit"></i>
          </Link>
          <button
            title={`Delete schema "${schema.name}"`}
            className="btn btn-link"
            onClick={() => setDeleteConfirmation(true)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      {deleteConfirmation && (
        <ModalPortal title="Confirmation needed" icon="fa-question-circle" onClose={() => setDeleteConfirmation(false)}>
          <>
            <div className="modal-body">
              <div className="text-center h5">
                You are about to delete the schema "{schema.name}" and its associated annotation.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
                  <i className="fas fa-window-close"></i>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={async (e) => {
                    try {
                      await remove();
                      setAlertMessage({ message: `Schema deleted`, type: "success" });
                    } catch (error) {
                      setAlertMessage({
                        message: `Error when deleting schema "${error?.message}"`,
                        type: "warning",
                      });
                    } finally {
                      if (onDelete) onDelete();
                      setDeleteConfirmation(false);
                    }
                  }}
                >
                  <i className={`fas ${loading ? "fa-spinner" : "fa-trash-alt"}`}></i>
                  Delete
                </button>
              </div>
            </div>
          </>
        </ModalPortal>
      )}
    </>
  );
};
