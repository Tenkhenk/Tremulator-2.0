import React from "react";

import { AnnotationModelFull, SchemaModelFull } from "../types";
import { useGet } from "../hooks/api";
import { keys, max, min } from "lodash";
import L, { Point } from "leaflet";
import { PageHeader } from "../components/page-header";
import { Link } from "react-router-dom";
import Loader from "../components/loader";
import { useQueryParam } from "../hooks/useQueryParam";
import { PaginationMenu } from "../components/pagination-menu";
import { config } from "../config/index";

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

  const [page, setPage] = useQueryParam<number>("page", 1);
  const { data: annotations, loading: annotationsLoading, fetch: fetchAnnotations } = useGet<AnnotationModelFull[]>(
    `/collections/${collectionID}/schema/${schemaID}/annotations`,
    { limit: config.annotations_page_limit, skip: (page - 1) * config.annotations_page_limit },
  );
  const { data: schema, loading: schemaLoading } = useGet<SchemaModelFull>(
    `/collections/${collectionID}/schema/${schemaID}`,
  );
  const changePage = (page: number) => {
    // page -1 cause page is 1-based
    fetchAnnotations({ limit: config.annotations_page_limit, skip: (page - 1) * config.annotations_page_limit });
    setPage(page);
  };

  const headers = schema ? keys(schema.schema.properties) : [];
  return (
    <>
      {schema && (
        <>
          <PageHeader title={`${schema.collection.name}: Edit schema ${schema.name}`}>
            <h1>
              <Link title={`Collection ${schema.collection.name}`} to={`/collections/${schema.collection.id}`}>
                {schema.collection.name}
              </Link>
            </h1>
          </PageHeader>

          <div className="row page-title">
            <div className="col-6 ">
              <h2>
                <i className="fas fa-vector-square mr-2"></i>
                {schema.nb_annotations}
                <span className="ml-2">"{schema.name}" annotations</span>
              </h2>
            </div>
            <div className="col-6  d-inline-flex  flex-row-reverse">
              {schema.nb_annotations > config.annotations_page_limit && (
                <PaginationMenu
                  page={page}
                  totalPages={Math.floor(schema.nb_annotations / config.annotations_page_limit)}
                  changePage={changePage}
                />
              )}
            </div>
          </div>
        </>
      )}
      {schemaLoading && <Loader />}

      <div className="row">
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
          {annotationsLoading && (
            <tbody>
              <Loader />
            </tbody>
          )}
        </table>
      </div>
    </>
  );
};
