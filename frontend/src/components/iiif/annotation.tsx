import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { LeafletEvent } from "leaflet";
import "leaflet-draw";
import { GeoJsonObject } from "geojson";
import { AnnotationType } from "../../types";

interface Props {
  annotations: Array<AnnotationType>;
  onCreate?: (geo: GeoJsonObject) => void;
  onUpdate?: (annotation: LeafletEvent) => void;
  onDelete?: (annotation: LeafletEvent) => void;
  onSelect?: (annotation: LeafletEvent) => void;
  selected?: number | null;
}

export const IIIFLayerAnnotation: React.FC<Props> = (props: Props) => {
  const { annotations, onCreate, onUpdate, onDelete, onSelect, selected } = props;

  const map = useMap();

  useEffect(() => {
    // Create layer for annotation
    const editableLayers = new L.FeatureGroup(
      annotations.map((annotation) => {
        const layer = L.geoJSON(annotation.geometry as GeoJsonObject, { editable: annotation.id === selected } as any);
        return layer;
      }),
    );
    // Add selection
    editableLayers.on("click", (e) => {
      if (onSelect) onSelect(e);
    });

    map.addLayer(editableLayers);

    // Add controls
    const drawControl = new (L.Control as any).Draw({
      edit: {
        featureGroup: editableLayers,
        remove: false,
        edit: false,
      },
      draw: {
        marker: false,
        circlemarker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
      },
    });
    map.addControl(drawControl);

    // listener for creation
    const createFn = (e: LeafletEvent) => {
      if (onCreate) onCreate(e.layer.toGeoJSON());
    };
    map.on("draw:created", createFn);

    // Listener for change
    const editFn = (e: LeafletEvent) => {
      console.log(e.layer.toGeoJSON());
      if (onUpdate) onUpdate(e);
    };
    map.on("draw:edited", editFn);

    // listener for deletion
    const deleteFn = (e: LeafletEvent) => {
      console.log(e.layer.toGeoJSON());
      if (onDelete) onDelete(e);
    };
    map.on("draw:deleted", deleteFn);

    // clean method
    return () => {
      map.removeLayer(editableLayers);
      map.removeControl(drawControl);
      map.off("draw:created", createFn);
      map.off("draw:edited", editFn);
      map.off("draw:deleted", deleteFn);
    };
  }, [map, annotations]);

  return null;
};
