import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { LeafletEvent } from "leaflet";
import { pick } from "lodash";
import "leaflet-draw";
import { GeoJSON, Geometry } from "geojson";
import { AnnotationType, SchemaType } from "../../types";

interface Props {
  annotations: Array<AnnotationType>;
  schemas: Array<SchemaType>;
  editMode: boolean;
  addMode: boolean;
  onCreate?: (geo: GeoJSON) => void;
  onUpdate?: (geo: GeoJSON) => void;
  onDelete?: (id: number) => void;
  onSelect?: (id: number) => void;
  selected?: number | null;
}

export const IIIFLayerAnnotation: React.FC<Props> = (props: Props) => {
  const { annotations, addMode, editMode, schemas, onCreate, onUpdate, onDelete, onSelect, selected } = props;
  const map = useMap();

  useEffect(() => {
    // Create layer for annotation
    const editableLayers = new L.FeatureGroup(
      annotations.map((annotation) => {
        const schema = schemas.find((item) => item.id === annotation.schemaId);

        const geo: GeoJSON = {
          type: "Feature",
          geometry: (annotation.geometry as any) as Geometry,
          properties: { annotation: pick(annotation, ["id", "data"]) },
        };
        const layer = L.geoJSON(geo, {
          editable: annotation.id === selected && editMode,
          style: {
            color: schema ? schema.color : "#ff7800",
            weight: annotation.id === selected ? 5 : 1,
            opacity: 0.65,
          },
        } as any);
        return layer;
      }),
    );
    // Add selection
    editableLayers.on("click", (e) => {
      if (onSelect) {
        const geo = e.layer.toGeoJSON();
        if (geo.properties && geo.properties.annotation) {
          onSelect(geo.properties.annotation.id);
        }
      }
    });
    // Add layer to the map
    map.addLayer(editableLayers);

    // If we are in edit mode, we enabled leaflet-draw
    if (editMode === true || addMode === true) {
      // Add controls
      const drawControl = new (L.Control as any).Draw({
        position: "topright",
        edit: {
          featureGroup: editableLayers,
          remove: false,
          edit: false,
        },
        draw: {
          marker: false,
          circlemarker: false,
          polyline: false,
          circle: false,
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
        },
      });
      map.addControl(drawControl);

      // listener for creation
      const createFn = (e: LeafletEvent) => {
        if (onCreate) onCreate(e.layer.toGeoJSON().geometry);
      };
      map.on("draw:created", createFn);

      // Listener for change
      const editFn = (e: LeafletEvent) => {
        console.log(e.layer.toGeoJSON());
        // if (onUpdate) onUpdate(e);
      };
      map.on("draw:edited", editFn);

      // listener for deletion
      const deleteFn = (e: LeafletEvent) => {
        console.log(e.layer.toGeoJSON());
        // if (onDelete) onDelete(e);
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
    } else {
      // clean method
      return () => {
        map.removeLayer(editableLayers);
      };
    }
  }, [addMode, schemas, map, annotations, editMode, onCreate, onUpdate, onDelete, onSelect, selected]);

  return null;
};
