import React from "react";

import { AnnotationModelFull, SchemaModelFull } from "../types";
import { useGet } from "../hooks/api";
import { keys, max, min } from "lodash";
import L, { Point } from "leaflet";
import { PageHeader } from "../components/page-header";
import { Link } from "react-router-dom";

interface Props {
  collectionID: number;
  schemaID: number;
}

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

export const AnnotationSchemaDatatable: React.FC<Props> = (props: Props) => {
  const { collectionID, schemaID } = props;

  const { data: annotations } = useGet<AnnotationModelFull[]>(
    `/collections/${collectionID}/schema/${schemaID}/annotations/`,
  );
  const { data: schema } = useGet<SchemaModelFull>(`/collections/${collectionID}/schema/${schemaID}`);
  const headers = schema ? keys(schema.schema.properties) : [];
  return (
    <>
      {schema && (
        <PageHeader title={`${schema.collection.name}: Edit schema ${schema.name}`}>
          <h1>
            <Link to={`/collections/${schema.collection.id}`}>{schema.collection.name}</Link>
          </h1>
        </PageHeader>
      )}
      <div className="container-fluid">
        <table className="table">
          {schema && (
            <thead>
              <tr>
                <th scope="col">Thumbnail</th>
                <th>image</th>
                {headers.map((f: string) => (
                  <th scope="col" key={f}>
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          {annotations && (
            <tbody>
              {annotations.map((a) => {
                const thumbnailURL = `${a.image.url.split("/").slice(0, -1).join("/")}/${getAnnotationIIIFRegion(
                  a,
                ).join(",")}/200,/0/default.jpg`;
                return (
                  <tr>
                    <th scope="row">
                      <img src={thumbnailURL} alt={a.image.name} title={thumbnailURL} />
                    </th>
                    <td>{a.image.name}</td>
                    {headers.map((f: string, i: number) => (
                      <td key={i}>{a.data[f] || ""}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};
