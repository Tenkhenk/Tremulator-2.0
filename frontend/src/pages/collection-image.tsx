import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ModalPortal from "../components/modal";
import { AppContext } from "../context/app-context";
import { useGet, useDelete } from "../hooks/api";
import { ImageFullType, CollectionFullType } from "../types/index";
import Loader from "../components/loader";
//leaflet IIIF
import { MapContainer } from "react-leaflet";
import { IIIFLayer } from "../components/iiif-layer";
import L from "leaflet";
import "leaflet-iiif";

interface Props {
  collectionID: string;
  imageID: string;
}

export const CollectionImage: React.FC<Props> = (props: Props) => {
  const { collectionID, imageID } = props;
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const { setAlertMessage, setCurrentImageID, setCurrentCollection } = useContext(AppContext);
  const history = useHistory();
  const { data: image, loading: imageLoading, error: imageError } = useGet<ImageFullType>(
    `/collections/${collectionID}/images/${imageID}`,
  );
  const { data: collection, error: collectionError } = useGet<CollectionFullType>(`/collections/${collectionID}`);
  const [deleteImage] = useDelete<any>(`/collections/${collectionID}/images/${imageID}`);

  setCurrentImageID(imageID);
  useEffect(() => {
    if (collection) {
      setCurrentCollection(collection);
    }
  }, [collection, setCurrentCollection]);

  useEffect(() => {
    if (imageError) setAlertMessage({ message: imageError.message, type: "warning" });
    if (collectionError) setAlertMessage({ message: collectionError.message, type: "warning" });
  }, [imageError, collectionError, setAlertMessage]);

  return (
    <div className="container-fluid">
      {imageLoading && <Loader />}
      {!imageLoading && image && (
        <>
          <div className="row">
            <div className="col-3">
              <i className="fas fa-vector-square mr-1"></i>
              {image.annotations.length} annotations
            </div>
            <div className="col-6 text-center">
              {image.name || image.url}{" "}
              <button className="btn" onClick={() => setNeedsConfirmation(true)}>
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            <div className="col-3 text-right">
              <i className="fas fa-sliders-h mr-2"></i>
              <i className="fas fa-map mr-2"></i>
              <i className="fas fa-expand"></i>
            </div>
          </div>
          <div className="row">
            {/* <img src={thumbnailURL(image.url)}/> */}
            <MapContainer center={[0, 0]} zoom={0} crs={L.CRS.Simple} scrollWheelZoom={true}>
              <IIIFLayer url={image.url} />
            </MapContainer>
          </div>

          {needsConfirmation && (
            <ModalPortal title="Confirmation needed" onClose={() => setNeedsConfirmation(false)}>
              <div className="h5">
                <div className="text-center">
                  <i className="far fa-question-circle fa-2x mb-3"></i>
                  <br />
                  Do you really want to delete
                  <br />"{image.name}"
                  {image.annotations.length > 0 && (
                    <span> and the {image.annotations.length} associated annotations</span>
                  )}
                  ?
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    No <i className="fas fa-window-close ml-1"></i>
                  </button>
                  <button
                    className="btn btn-danger ml-2"
                    onClick={async () => {
                      try {
                        await deleteImage();
                        setAlertMessage({ message: "Image deleted successfully.", type: "success" });
                        setNeedsConfirmation(false);
                        history.push(`/collections/${collectionID}`);
                      } catch (error) {
                        setAlertMessage({ message: error.message, type: "warning" });
                      }
                    }}
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Yes
                  </button>
                </div>
              </div>
            </ModalPortal>
          )}
        </>
      )}
    </div>
  );
};
