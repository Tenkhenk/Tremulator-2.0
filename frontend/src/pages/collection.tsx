import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { useGet } from "../hooks/api";
import { CollectionModelFull, ImageModel } from "../types/index";
import ImageUploadForms from "../components/image/upload-forms";
import Modal from "../components/modal";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { Image } from "../components/image/image";

interface Props {
  id: string;
}

export const Collection: React.FC<Props> = (props: Props) => {
  const { id } = props;
  const { setAlertMessage } = useContext(AppContext);

  const [isAddingPicture, setIsAddingPicture] = useState<Boolean>(false);
  const { data: collection, loading, error, fetch } = useGet<CollectionModelFull>(`/collections/${id}`);

  // WHen an error occurred
  //  => we set it in the context
  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error, setAlertMessage]);

  return (
    <>
      {loading && <Loader />}
      {collection && (
        <>
          <PageHeader title={`Collection ${collection.name}`}>
            <h1>{collection.name}</h1>
            <Link to={`/collections/${collection.id}/edit`} title={`Edit collection ${collection.name}`}>
              <i className="fas fa-edit"></i>
            </Link>
          </PageHeader>

          <div className="row page-title">
            <div className="col">
              <h2>{collection.images.length} Pictures</h2>
              <button onClick={() => setIsAddingPicture(true)} className="btn btn-link">
                <i className="far fa-plus-square"></i>
              </button>
            </div>
          </div>

          <div className="row">
            {collection.images.length > 0 && (
              <div className="col gallery">
                {collection.images.map((image: ImageModel) => (
                  <Image key={image.id} image={image} onDelete={() => fetch()} />
                ))}
              </div>
            )}
            {collection.images.length === 0 && (
              <div className="col-4 offset-md-4 text-center text-muted justify-content-center">
                <p>No images</p>
                <button onClick={() => setIsAddingPicture(true)} className="btn btn-link">
                  <i className="fas fa-upload"></i>
                  Start by upload images
                </button>
              </div>
            )}
          </div>
          {isAddingPicture && (
            <Modal icon="fa-images" title="Add pictures" onClose={() => setIsAddingPicture(false)}>
              <ImageUploadForms
                collection={collection}
                onUploaded={() => {
                  setIsAddingPicture(false);
                  fetch();
                }}
              />
            </Modal>
          )}
        </>
      )}
    </>
  );
};
