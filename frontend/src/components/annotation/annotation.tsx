import React, { FC, useContext, useState } from "react";
import { AnnotationModel, CollectionModelFull } from "../../types";
import ModalPortal from "../modal";
import { useDelete } from "../../hooks/api";
import { AppContext } from "../../context/app-context";
import { AnnotationForm } from "./form";

interface Props {
  collection: CollectionModelFull;
  annotation: AnnotationModel;
  isSelected: boolean;
  editMode: boolean;
  toggleSelected: (force?: boolean) => void;
  setEditMode: (b: boolean) => void;
  onSaved?: () => void;
}
export const Annotation: FC<Props> = (props: Props) => {
  const { annotation, collection, editMode, isSelected, setEditMode, toggleSelected, onSaved } = props;

  const schema = collection.schemas.find((e) => e.id === annotation.schema_id);

  // hooks
  const { setAlertMessage } = useContext(AppContext);
  const [remove, { loading }] = useDelete<AnnotationModel>(
    `/collections/${collection.id}/images/${annotation.image_id}/annotations/${annotation.id}`,
  );

  // States
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);

  return (
    <>
      <div className={`card ${isSelected ? "selected" : ""}`}>
        <div
          className="card-header d-flex justify-content-between"
          style={schema ? { borderLeft: `10px solid ${schema.color}` } : {}}
          onClick={() => {
            toggleSelected();
            setEditMode(false);
          }}
        >
          <h5>Annotation #{annotation.id}</h5>
          <div>
            <button
              title={`Edit annotation #${annotation.id}`}
              className="btn btn-link"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                toggleSelected(true);
                setEditMode(true);
              }}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              title={`Delete annotation #${annotation.id}`}
              className="btn btn-link"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                toggleSelected(true);
                setDeleteConfirmation(true);
              }}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div className="card-body">
          {!editMode && (
            <>
              {Object.keys(annotation.data).map((field) => (
                <div key={field} className="field">
                  <span className="name">{field}</span>
                  <span className="value">{annotation.data[field]}</span>
                </div>
              ))}
            </>
          )}
          {editMode && (
            <AnnotationForm
              withTitle={false}
              annotation={annotation}
              schemas={collection.schemas}
              collectionID={collection.id}
              onSaved={() => {
                setEditMode(false);
                if (onSaved) onSaved();
              }}
              onCancel={() => setEditMode(false)}
            />
          )}
        </div>
      </div>

      {deleteConfirmation && (
        <ModalPortal title="Confirmation needed" icon="fa-question-circle" onClose={() => setDeleteConfirmation(false)}>
          <div className="h5">
            <div className="text-center">You are about to delete the annotation #{annotation.id}.</div>
            <div className="text-center mt-3">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
                <i className="fas fa-window-close mr-1"></i>
                Cancel
              </button>
              <button
                className="btn btn-danger ml-2"
                onClick={async (e) => {
                  try {
                    await remove();
                    setAlertMessage({ message: `Annotation deleted`, type: "success" });
                  } catch (error) {
                    setAlertMessage({
                      message: `Error when deleting Annotation "${error?.message}"`,
                      type: "warning",
                    });
                  } finally {
                    if (onSaved) onSaved();
                    setDeleteConfirmation(false);
                  }
                }}
              >
                <i className={`fas mr-1 ${loading ? "fa-spinner" : "fa-trash-alt"}`}></i>
                Delete
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};
