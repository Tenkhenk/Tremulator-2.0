import React, { useContext, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
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
import * as geojsonBbox from "geojson-bbox";

/**
 * Deserialization of the `toBBoxString`.
 */
function fromBBoxString(bbox: string): LatLngBounds | null {
  if (bbox === "") return null;
  const parsed = bbox.split(",").map(parseFloat);
  return latLngBounds(latLng(parsed[1], parsed[0]), latLng(parsed[3], parsed[2]));
}

/**
 * Serialization to `toBBoxString`.
 */
function toBBoxString(bbox: Array<Number>): string | null {
  if (!bbox! || bbox.length !== 4) return null;
  return bbox.join(",");
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
  const [deleteImage, { loading: delLoading }] = useDelete(`/collections/${collectionID}/images/${imageID}`);

  // States
  // ~~~~~~~~~~~~~~~~~~
  // for the image deletion
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  // For the annotation that is currently created
  const [annotation, setAnnotation] = useState<AnnotationModel | null>(null);
  // Id of the selected annotation
  const [selectedAnnotation, setSelectedAnnotation] = useQueryParam<number | null>("annotation", null);
  //Set mode (view / new / edit )
  const [mode, setMode] = useQueryParam<string>("mode", "view");
  // Map BBOX
  const [bbox, setBbox] = useQueryParam<string>("bbox", "", true);
  // iiif quality mode
  const [quality, setQuality] = useQueryParam<string>("quality", "default");
  // View annotation
  const [sideOpened, setSideOpened] = useQueryParam<boolean>("opened", true);
  // Selected tool
  const [tool, setTool] = useQueryParam<string>("tool", "");

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
    if (mode !== "new" && image && selectedAnnotation) {
      setAnnotation(image.annotations?.find((a) => a.id === selectedAnnotation) || null);
    }
  }, [image, mode, selectedAnnotation, setAnnotation]);

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
                <div>
                  <h2>{image.name || image.url} </h2>
                  <button title="Delete picture" className="btn btn-link" onClick={() => setNeedsConfirmation(true)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
                <div className="h5">
                  <button
                    title={`Open / Close Annotations`}
                    className="btn btn-link"
                    onClick={() => setSideOpened(!sideOpened)}
                  >
                    {sideOpened && (
                      <>
                        <i className="fas fa-chevron-left mr-1"></i>{" "}
                      </>
                    )}
                    <i className="fas fa-vector-square mr-1"></i>
                    {image.annotations.length}
                    {!sideOpened && (
                      <>
                        {" "}
                        <i className="fas fa-chevron-right mr-1"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="row image-viewer-body">
              <div className="col image" id="image-viewer-body">
                <MapContainer doubleClickZoom={!Browser.mobile} center={[0, 0]} zoom={0} crs={L.CRS.Simple}>
                  <IIIFLayer
                    url={image.url}
                    bbox={fromBBoxString(bbox)}
                    quality={quality}
                    setQuality={setQuality}
                    sideOpened={sideOpened}
                    onMoveEnd={(e) => {
                      setBbox(e.toBBoxString());
                    }}
                  />
                  {collection.schemas.length > 0 && (
                    <IIIFLayerAnnotation
                      editMode={mode !== "view"}
                      addMode={mode !== "new"}
                      schemas={collection.schemas}
                      tool={tool}
                      setTool={setTool}
                      annotations={
                        mode === "new" && annotation
                          ? image.annotations.concat([annotation])
                          : image.annotations.map((a) => (a.id === annotation?.id ? annotation : a))
                      }
                      selected={annotation ? annotation.id : selectedAnnotation}
                      onCreate={(geo) => {
                        setMode("new");
                        setSideOpened(true);
                        setAnnotation({
                          id: -1,
                          order: -1,
                          data: {},
                          geometry: geo,
                          schema_id: -1,
                          image_id: image.id,
                          created_at: "",
                          updated_at: "",
                        });
                      }}
                      onUpdate={(e) => {
                        setAnnotation((annotation) => Object.assign({}, annotation, e));
                      }}
                      onSelect={(id) => {
                        setSelectedAnnotation((prev) => {
                          if (prev === id) return null;
                          return id;
                        });
                      }}
                    />
                  )}
                </MapContainer>
              </div>

              {sideOpened === true && (
                <div className="col-4 annotation">
                  {collection.schemas.length === 0 && (
                    <div className="text-center text-muted justify-content-center">
                      <p>To create annotations, you must create an schema annotation schema</p>
                      <Link title="Create a schema" to={`/collections/${collection.id}/schemas/new`}>
                        Create a schema
                      </Link>
                    </div>
                  )}
                  {collection.schemas.length > 0 && (
                    <>
                      {(mode === "view" || mode === "edit") && (
                        <>
                          {image.annotations.length === 0 && (
                            <p className="text-center text-muted">
                              To create an annotation, click on a shape button on the top-right corner of the image
                            </p>
                          )}
                          <AnnotationAccordion
                            collection={collection}
                            annotations={image.annotations.map((a) => (a.id === annotation?.id ? annotation : a))}
                            selected={selectedAnnotation}
                            setSelected={(a) => {
                              if (a !== null) {
                                setSelectedAnnotation(a.id);
                                const bbox = geojsonBbox(a.geometry);
                                setBbox(toBBoxString(bbox) || "");
                              } else {
                                setSelectedAnnotation(null);
                              }
                            }}
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
                    </>
                  )}
                </div>
              )}
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
                  {delLoading && <Loader />}
                  {!delLoading && (
                    <div className="text-center h5">
                      Do you really want to delete
                      <br />"{image.name}"
                      {image.annotations.length > 0 && (
                        <span> and the {image.annotations.length} associated annotations</span>
                      )}
                      ?
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setNeedsConfirmation(false)}>
                    No <i className="fas fa-window-close"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={delLoading}
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
