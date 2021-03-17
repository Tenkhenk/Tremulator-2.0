import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ModalPortal from "../components/modal";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { useGet, useDelete } from "../hooks/api";
import { ImageFullType, CollectionFullType } from "../types/index";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
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

  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);

  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const { data: image, loading, error } = useGet<ImageFullType>(`/collections/${collectionID}/images/${imageID}`);
  const [deleteImage] = useDelete<any>(`/collections/${collectionID}/images/${imageID}`);

  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error]);

  return (
    <>
      {loading && <Loader />}
      {image && (
        <>
          <PageHeader>
            <h1>
              <Link to={`/collections/${image.collection.id}`}>{image.collection.name}</Link>
            </h1>
          </PageHeader>

          <div className="container-fluid">
            <div className="d-flex justify-content-between">
              <div>
                <i className="fas fa-vector-square mr-1"></i>
                {image.annotations.length} annotations
              </div>
              <div>
                <h2>
                  {image.name || image.url}{" "}
                  <button className="btn" onClick={() => setNeedsConfirmation(true)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </h2>
              </div>
              <div>
                <i className="fas fa-sliders-h mr-2"></i>
                <i className="fas fa-map mr-2"></i>
                <i className="fas fa-expand"></i>
              </div>
            </div>

            <div className="row">
              <MapContainer center={[0, 0]} zoom={0} crs={L.CRS.Simple} scrollWheelZoom={true}>
                <IIIFLayer url={image.url} />
              </MapContainer>
            </div>
          </div>

          {needsConfirmation && (
            <ModalPortal
              icon="fa-question-circle"
              title="Confirmation needed"
              onClose={() => setNeedsConfirmation(false)}
            >
              <div className="h5">
                <div className="text-center">
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
    </>
  );
};
