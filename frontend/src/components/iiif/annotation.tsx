import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { LeafletEvent } from "leaflet";
import { pick } from "lodash";
import "leaflet-draw";
import { GeoJSON, Geometry } from "geojson";
import { AnnotationModel, SchemaModel } from "../../types";

interface Props {
  annotations: Array<AnnotationModel>;
  schemas: Array<SchemaModel>;
  editMode: boolean;
  addMode: boolean;
  onCreate?: (geo: GeoJSON) => void;
  onUpdate?: (geo: GeoJSON) => void;
  onSelect?: (id: number) => void;
  selected?: number | null;
}

export const IIIFLayerAnnotation: React.FC<Props> = (props: Props) => {
  const { annotations, addMode, editMode, schemas, onCreate, onUpdate, onSelect, selected } = props;
  const map = useMap();

  useEffect(() => {
    const drawLayer = new L.FeatureGroup();
    const annotationsLayer = new L.FeatureGroup();

    annotations.forEach((annotation) => {
      const schema = schemas.find((item) => item.id === annotation.schema_id);
      const isEditable = annotation.id === selected && editMode;
      const geo: GeoJSON = {
        type: "Feature",
        geometry: (annotation.geometry as any) as Geometry,
        properties: { annotation: pick(annotation, ["id", "data"]) },
      };
      L.geoJSON(geo, {
        editable: isEditable,
        style: {
          color: schema ? schema.color : "#FF0000",
          weight: annotation.id === selected ? 5 : 1,
          opacity: 0.65,
        },
        onEachFeature: (feature: any, layer: any) => {
          if (isEditable) drawLayer.addLayer(layer);
          else annotationsLayer.addLayer(layer);
        },
      } as any);
    });

    // Add selection
    annotationsLayer.on("click", (e) => {
      if (onSelect) {
        const geo = e.layer.toGeoJSON();
        if (geo.properties && geo.properties.annotation) {
          onSelect(geo.properties.annotation.id);
        }
      }
    });
    // Add layer to the map
    map.addLayer(annotationsLayer);
    map.addLayer(drawLayer);

    // If we are in edit mode, we enabled leaflet-draw
    if (editMode === true || addMode === true) {
      // Add controls
      const drawControl = new (L.Control as any).Draw({
        position: "topright",
        edit: {
          featureGroup: drawLayer,
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
      const editFn = (e: any) => {
        if (onUpdate) onUpdate((drawLayer.toGeoJSON() as any).features[0].geometry);
      };
      map.on("draw:editvertex", editFn);

      // clean method
      return () => {
        map.removeLayer(annotationsLayer);
        map.removeLayer(drawLayer);
        map.removeControl(drawControl);
        map.off("draw:created", createFn);
        map.off("draw:editvertex", editFn);
      };
    } else {
      // clean method
      return () => {
        map.removeLayer(annotationsLayer);
        map.removeLayer(drawLayer);
      };
    }
  }, [addMode, schemas, map, annotations, editMode, onCreate, onUpdate, onSelect, selected]);

  return null;
};
