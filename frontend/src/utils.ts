import { AnnotationModelFull } from "./types";
import L, { Point } from "leaflet";
import { max, min } from "lodash";

export function getAnnotationIIIFRegion(annotation: AnnotationModelFull): Array<number> {
  const points = annotation.geometry.coordinates[0].map((c: [number, number]) =>
    // geoJson is lnglat, leaflet is latlng => swap
    L.CRS.Simple.latLngToPoint(L.latLng([c[1], c[0], 0]), 0),
  );
  const x0: number = min(points.map((p: Point) => p.x)) || 0;
  const y0: number = min(points.map((p: Point) => p.y)) || 0;
  const x1: number = max(points.map((p: Point) => p.x)) || 0;
  const y1: number = max(points.map((p: Point) => p.y)) || 0;

  const region = [x0, y0, Math.abs(x1 - x0), Math.abs(y1 - y0)];
  // fallback to 0 cause annotation points can be drawn off the picture
  return region.map((c) => max([c, 0])) as Array<number>;
}

export function getAnnotationDetailUrl(annotation: AnnotationModelFull): string {
  return `${annotation.image.url.split("/").slice(0, -1).join("/")}/${getAnnotationIIIFRegion(annotation).join(
    ",",
  )}/max/0/default.jpg`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getServerUrl(): string {
  return (
    window.location.protocol +
    "//" +
    window.location.hostname +
    (window.location.port ? ":" + window.location.port : "")
  );
}
