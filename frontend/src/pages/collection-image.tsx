import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ModalPortal from "../components/modal";
import { AppContext } from "../context/app-context";
import { useGet, useDelete } from "../hooks/api";
import { useQueryParam } from "../hooks/useQueryParam";
import { AnnotationType, CollectionFullType, ImageFullType } from "../types/index";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { AnnotationAccordion } from "../components/annotation/accordion";
import { ImagePageHeader } from "../components/image-page-header";
import { MapContainer } from "react-leaflet";
import { IIIFLayer } from "../components/iiif";
import { IIIFLayerAnnotation } from "../components/iiif/annotation";
import { AnnotationForm } from "../components/annotation/form";
import L, { latLng, latLngBounds, LatLngBounds } from "leaflet";

/**
 * Desiarlization of the `toBBoxString`.
 */
function fromBBoxString(bbox: string): LatLngBounds | null {
  if (bbox === "") return null;
  const parsed = bbox.split(",").map(parseFloat);
  return latLngBounds(latLng(parsed[1], parsed[0]), latLng(parsed[3], parsed[2]));
}

interface Props {
  collectionID: string;
  imageID: string;
}

export const CollectionImage: React.FC<Props> = (props: Props) => {
  const { collectionID, imageID } = props;

  // Hooks
  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);
  // Data hooks
  const { data: collection, loading: collectionLoading, error: collectionError } = useGet<CollectionFullType>(
    `/collections/${collectionID}`,
  );
  const { data: image, loading: imageLoading, error: imageError, fetch } = useGet<ImageFullType>(
    `/collections/${collectionID}/images/${imageID}`,
  );
  const [deleteImage] = useDelete<any>(`/collections/${collectionID}/images/${imageID}`);

  // States
  // ~~~~~~~~~~~~~~~~~~
  // for the image deletion
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  // For the annotation that is currently created
  const [annotation, setAnnotation] = useState<AnnotationType | null>(null);
  // Id of the selected annotation
  const [selectedAnnotation, setSelectedAnnotation] = useQueryParam<number | null>("annotation", null);
  // Map BBOX
  const [bbox, setBbox] = useQueryParam<string>("bbox", "", true);

  // When error happened
  //  => set the alerte
  useEffect(() => {
    if (collectionError) setAlertMessage({ message: collectionError.message, type: "warning" });
    if (imageError) setAlertMessage({ message: imageError.message, type: "warning" });
  }, [collectionError, imageError, setAlertMessage]);

  // When the image changed
  //  => reset the state
  useEffect(() => {
    setAnnotation(null);
    setNeedsConfirmation(false);
  }, [imageID]);

  return (
    <>
      {(imageLoading || collectionLoading) && <Loader />}
      {collection && image && (
        <>
          <PageHeader title={`${image.collection.name}: ${image.name}`}>
            <ImagePageHeader collection={collection} image={image} />
          </PageHeader>

          <div className="container-fluid">
            <div className="row justify-content-center">
              <h2>
                {image.name || image.url}{" "}
                <button className="btn" onClick={() => setNeedsConfirmation(true)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </h2>
            </div>

            <div className="row">
              <div className="col-8">
                <MapContainer center={[0, 0]} zoom={0} crs={L.CRS.Simple} scrollWheelZoom={true}>
                  <IIIFLayer
                    url={image.url}
                    bbox={fromBBoxString(bbox)}
                    onMoveEnd={(e) => {
                      setBbox(e.toBBoxString());
                    }}
                  />
                  <IIIFLayerAnnotation
                    editMode={false}
                    addMode={true}
                    schemas={collection.schemas}
                    annotations={annotation ? image.annotations.concat([annotation]) : image.annotations}
                    selected={annotation ? annotation.id : selectedAnnotation}
                    onCreate={(geo) => {
                      setAnnotation({ id: -1, data: {}, geometry: geo, schemaId: -1 });
                    }}
                    onUpdate={(e) => {
                      console.log(e);
                    }}
                    onSelect={(id) => {
                      setSelectedAnnotation((prev) => {
                        if (prev === id) return null;
                        return id;
                      });
                    }}
                  />
                </MapContainer>
              </div>

              <div className="col-4">
                {!annotation && (
                  <>
                    <h3>
                      <i className="fas fa-vector-square mr-1"></i>
                      {image.annotations.length} annotations
                    </h3>
                    <AnnotationAccordion
                      onClick={(a) => setSelectedAnnotation(a.id)}
                      selected={selectedAnnotation}
                      annotations={image.annotations}
                    />
                  </>
                )}
                {collection && annotation && (
                  <AnnotationForm
                    annotation={annotation}
                    schemas={collection?.schemas || []}
                    collectionID={collection.id}
                    imageID={image.id}
                    onSaved={(a) => {
                      setAnnotation(null);
                      setSelectedAnnotation(a.id);
                      fetch();
                    }}
                    onCancel={() => setAnnotation(null)}
                  />
                )}
              </div>
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
