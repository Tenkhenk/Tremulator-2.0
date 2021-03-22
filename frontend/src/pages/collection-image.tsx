import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ModalPortal from "../components/modal";
import { AppContext } from "../context/app-context";
import { useGet, useDelete } from "../hooks/api";
import { useQueryParam } from "../hooks/useQueryParam";
import { AnnotationModel, CollectionModelFull, ImageModelFull } from "../types/index";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { AnnotationAccordion } from "../components/annotation/accordion";
import { ImagePageHeader } from "../components/image/page-header";
import { MapContainer } from "react-leaflet";
import { IIIFLayer } from "../components/iiif";
import { IIIFLayerAnnotation } from "../components/iiif/annotation";
import { AnnotationForm } from "../components/annotation/form";
import L, { Browser, latLng, latLngBounds, LatLngBounds } from "leaflet";

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
  const { data: collection, loading: collectionLoading, error: collectionError } = useGet<CollectionModelFull>(
    `/collections/${collectionID}`,
  );
  const { data: image, loading: imageLoading, error: imageError, fetch } = useGet<ImageModelFull>(
    `/collections/${collectionID}/images/${imageID}`,
  );
  const [deleteImage] = useDelete(`/collections/${collectionID}/images/${imageID}`);

  // States
  // ~~~~~~~~~~~~~~~~~~
  // for the image deletion
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  // For the annotation that is currently created
  const [annotation, setAnnotation] = useState<AnnotationModel | null>(null);
  // Id of the selected annotation
  const [selectedAnnotation, setSelectedAnnotation] = useQueryParam<number | null>("annotation", null);
  //Set mode (view / new / edit)
  const [mode, setMode] = useQueryParam<string>("mode", "view");
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

  useEffect(() => {
    if (image && selectedAnnotation && image.annotations.findIndex((a) => a.id === selectedAnnotation)) {
      setAnnotation(image.annotations?.find((a) => a.id === selectedAnnotation) || null);
    } else {
      setAnnotation(null);
    }
  }, [image, selectedAnnotation, setAnnotation]);
  return (
    <>
      {(imageLoading || collectionLoading) && <Loader />}
      {collection && image && (
        <>
          <PageHeader title={`${image.collection.name}: ${image.name}`}>
            <ImagePageHeader collection={collection} image={image} />
          </PageHeader>

          <div className="image-viewer">
            <div className="row image-viewer-header page-title">
              <div className="col">
                <h2>{image.name || image.url} </h2>
                <button title="Delete picture" className="btn btn-link" onClick={() => setNeedsConfirmation(true)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <div className="image-viewer-body">
              <div className="image">
                <MapContainer doubleClickZoom={!Browser.mobile} center={[0, 0]} zoom={0} crs={L.CRS.Simple}>
                  <IIIFLayer
                    url={image.url}
                    bbox={fromBBoxString(bbox)}
                    onMoveEnd={(e) => {
                      setBbox(e.toBBoxString());
                    }}
                  />
                  <IIIFLayerAnnotation
                    editMode={mode !== "view"}
                    addMode={mode !== "new"}
                    schemas={collection.schemas}
                    annotations={
                      annotation
                        ? image.annotations.filter((e) => e.id !== annotation.id).concat([annotation])
                        : image.annotations
                    }
                    selected={annotation ? annotation.id : selectedAnnotation}
                    onCreate={(geo) => {
                      setMode("new");
                      setAnnotation({
                        id: -1,
                        data: {},
                        geometry: geo,
                        schema_id: -1,
                        image_id: image.id,
                        created_at: "",
                        updated_at: "",
                      });
                    }}
                    onUpdate={(e) => {
                      // console.log(Object.assign({}, annotation, { geometry: e }));
                      setAnnotation((annotation) => Object.assign({}, annotation, { geometry: e }));
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

              <div className="annotation">
                {(mode === "view" || mode === "edit") && (
                  <>
                    <h3>
                      <i className="fas fa-vector-square mr-1"></i>
                      {image.annotations.length} annotations
                    </h3>
                    <AnnotationAccordion
                      collection={collection}
                      annotations={image.annotations.map((a) => (a.id === annotation?.id ? annotation : a))}
                      selected={selectedAnnotation}
                      setSelected={(a) => setSelectedAnnotation(a?.id || null)}
                      editMode={mode === "edit"}
                      setEditMode={(b: boolean) => setMode(b ? "edit" : "view")}
                      onSaved={() => fetch()}
                    />
                  </>
                )}
                {mode === "new" && collection && annotation && (
                  <AnnotationForm
                    annotation={annotation}
                    schemas={collection?.schemas || []}
                    collectionID={collection.id}
                    onSaved={(id) => {
                      setAnnotation(null);
                      setSelectedAnnotation(id);
                      setMode("view");
                      fetch();
                    }}
                    onCancel={() => {
                      setAnnotation(null);
                      setMode("view");
                    }}
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
              <>
                <div className="modal-body">
                  <div className="text-center h5">
                    Do you really want to delete
                    <br />"{image.name}"
                    {image.annotations.length > 0 && (
                      <span> and the {image.annotations.length} associated annotations</span>
                    )}
                    ?
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    No <i className="fas fa-window-close"></i>
                  </button>
                  <button
                    className="btn btn-danger"
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
                    <i className="fas fa-trash-alt"></i> Yes
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
