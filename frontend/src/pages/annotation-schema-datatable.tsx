import React from "react";

import { AnnotationModelFull, SchemaModelFull } from "../types";
import { useGet } from "../hooks/api";
import { keys } from "lodash";
import { PageHeader } from "../components/page-header";
import { Link } from "react-router-dom";
import Loader from "../components/loader";
import { useQueryParam } from "../hooks/useQueryParam";
import { PaginationMenu } from "../components/pagination-menu";
import { config } from "../config/index";
import { getAnnotationIIIFRegion } from "../utils";

interface Props {
  collectionID: number;
  schemaID: number;
}

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
      {(schemaLoading || annotationsLoading) && <Loader />}

      <div className="row">
        <table className="table annotations-table">
          {schema && (
            <thead>
              <tr>
                <th scope="col">Detail</th>
                <th>Image</th>
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
                ).join(",")}/max/0/default.jpg`;
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
