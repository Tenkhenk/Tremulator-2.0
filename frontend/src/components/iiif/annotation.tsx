import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L, { LeafletEvent } from "leaflet";
import { sortBy, pick } from "lodash";
import "leaflet-draw";
import { GeoJSON, Geometry } from "geojson";
import { AnnotationModel, SchemaModel } from "../../types";
import * as geojsonArea from "@mapbox/geojson-area";

interface Props {
  annotations: Array<AnnotationModel>;
  schemas: Array<SchemaModel>;
  editMode: boolean;
  addMode: boolean;
  onCreate?: (geo: { geometry: GeoJSON; maxZoom: number }) => void;
  onUpdate?: (geo: { geometry: GeoJSON; maxZoom: number }) => void;
  onSelect?: (id: number) => void;
  selected?: number | null;
  setTool?: (tool: string) => void;
  tool?: string;
}

export const IIIFLayerAnnotation: React.FC<Props> = (props: Props) => {
  const { annotations, addMode, editMode, schemas, onCreate, onUpdate, onSelect, selected, tool, setTool } = props;
  const map = useMap();

  useEffect(() => {
    const drawLayer = new L.FeatureGroup();
    const annotationsLayer = new L.FeatureGroup();

    // We sort the annotation by area, so big ones are in background
    sortBy(annotations, (a) => geojsonArea.geometry(a.geometry as Geometry)).forEach((annotation) => {
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
            showArea: false,
          },
          rectangle: {
            showRadius: false,
          },
        },
      });
      map.addControl(drawControl);

      // selected tool
      switch (tool) {
        case "polygon":
          (document?.querySelector(".leaflet-draw-draw-polygon") as HTMLElement).click();
          break;
        case "rectangle":
          (document?.querySelector(".leaflet-draw-draw-rectangle") as HTMLElement).click();
          break;
      }

      // listener for creation
      const createFn = (e: LeafletEvent) => {
        if (onCreate) {
          console.log("create");
          onCreate({ geometry: e.layer.toGeoJSON().geometry, maxZoom: map.getMaxZoom() });
          if (setTool) setTool((e as any).layerType);
        }
      };
      map.on("draw:created", createFn);

      const cancelFn = (e: any) => {
        console.log("cancelFn", e, editMode, addMode, selected);
        if (setTool) setTool("");
      };
      const drawMenu: any = document?.querySelector(".leaflet-draw-actions  a");
      if (drawMenu) {
        console.log("register");
        drawMenu["onclick"] = cancelFn;
      }

      // Listener for change
      const editFn = (e: any) => {
        const geojson = (drawLayer.toGeoJSON() as any).features[0];
        if (onUpdate) onUpdate({ geometry: geojson.geometry, maxZoom: map.getMaxZoom() });
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
  }, [addMode, schemas, map, annotations, editMode, onCreate, onUpdate, onSelect, selected, tool, setTool]);

  return null;
};
