import { AnnotationModelFull } from "./types";
import L, { Point } from "leaflet";
import { max, min } from "lodash";

export const getAnnotationIIIFRegion = (annotation: AnnotationModelFull) => {
  const points = annotation.geometry.coordinates[0].map((c: [number, number]) =>
    // geoJson is lnglat, leaflet is latlng => swap
    // maxZoom is used to scale correctly coord to image pixels space
    L.CRS.Simple.latLngToPoint(L.latLng([c[1], c[0], 0]), annotation.maxZoom),
  );
  const x0: number = min(points.map((p: Point) => p.x)) || 0;
  const y0: number = min(points.map((p: Point) => p.y)) || 0;
  const x1: number = max(points.map((p: Point) => p.x)) || 0;
  const y1: number = max(points.map((p: Point) => p.y)) || 0;

  const region = [x0, y0, Math.abs(x1 - x0), Math.abs(y1 - y0)];
  // fallback to 0 cause annotation points can be drawn off the picture
  return region.map((c) => max([c, 0]));
};

export const latLongToIiif = (point: [number, number]): [number, number] => {
  return [0, 0];
};

export const iiifToLatLng = (point: [number, number]): [number, number] => {
  return [0, 0];
};