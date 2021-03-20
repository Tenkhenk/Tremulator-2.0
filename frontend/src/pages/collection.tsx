import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { useGet } from "../hooks/api";
import { CollectionFullType, ImageType } from "../types/index";
import ImageUploadForms from "../components/image-upload-forms";
import Modal from "../components/modal";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { ImageThumbnail } from "../components/image-thumbnail";

interface Props {
  id: string;
}

export const Collection: React.FC<Props> = (props: Props) => {
  const { id } = props;
  const { setAlertMessage } = useContext(AppContext);

  const [isAddingPicture, setIsAddingPicture] = useState<Boolean>(false);
  const { data: collection, loading, error } = useGet<CollectionFullType>(`/collections/${id}`);

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

          <div className="row">
            <div className="col d-flex justify-content-start">
              <h3>{collection.images.length} Pictures </h3>
              <button onClick={() => setIsAddingPicture(true)} className="btn btn-link btn-sm">
                <i className="far fa-plus-square fa-2x" aria-label="add a picture" title="add a picture"></i>
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col d-flex flex-wrap justify-content-center">
              {collection.images.map((image: ImageType) => (
                <Link key={image.id} to={`/collections/${collection.id}/images/${image.id}`}>
                  <ImageThumbnail image={image} />
                </Link>
              ))}
            </div>
          </div>
          {isAddingPicture && (
            <Modal title="Add pictures" onClose={() => setIsAddingPicture(false)}>
              <ImageUploadForms collection={collection} />
            </Modal>
          )}
        </>
      )}
    </>
  );
};
