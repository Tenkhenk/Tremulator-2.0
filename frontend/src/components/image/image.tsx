import React, { FC, useContext, useState } from "react";
import { ImageModel } from "../../types";
import { Link } from "react-router-dom";
import ModalPortal from "./../modal";
import { useDelete } from "../../hooks/api";
import { AppContext } from "../../context/app-context";

// function to compute the tumbnail url from the iiif url
const thumbnailURL = (iiifURL: string) => iiifURL.split("/").slice(0, -1).join("/") + "/full/200,/0/default.jpg";

interface Props {
  image: ImageModel;
  onDelete?: () => void;
}
export const Image: FC<Props> = (props: Props) => {
  const { image, onDelete } = props;

  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const { setAlertMessage } = useContext(AppContext);
  const [remove, { loading }] = useDelete(`/collections/${image.collection_id}/images/${image.id}`);

  return (
    <>
      <Link title={`Image ${image.name}`} to={`/collections/${image.collection_id}/images/${image.id}`}>
        <div className="card-image">
          <div className="card-pictos">
            <span>
              <i className="fas fa-vector-square mr-1"></i>
              {image.nb_annotations}
            </span>
          </div>
          <img src={thumbnailURL(image.url)} alt={image.name} />
          <div className="card-legend">
            <p>{image.name}</p>
          </div>
          <div className="card-actions">
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
      </Link>
      {deleteConfirmation && (
        <ModalPortal title="Confirmation needed" icon="fa-question-circle" onClose={() => setDeleteConfirmation(false)}>
          <div className="h5">
            <div className="text-center">
              You are about to delete the image "{image.name}" and its associated annotations ({image.nb_annotations}).
            </div>
            <div className="text-center">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmation(false)}>
                <i className="fas fa-window-close"></i>
                Cancel
              </button>
              <button
                className="btn btn-danger ml-2"
                onClick={async (e) => {
                  try {
                    await remove();
                    setAlertMessage({ message: `Image deleted`, type: "success" });
                  } catch (error) {
                    setAlertMessage({
                      message: `Error when deleting image "${error?.message}"`,
                      type: "warning",
                    });
                  } finally {
                    if (onDelete) onDelete();
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
