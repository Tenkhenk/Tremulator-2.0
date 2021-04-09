import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { keys } from "lodash";

import { AnnotationModelFull, SchemaModelFull } from "../types";
import { getAnnotationDetailUrl } from "../utils";
import { config } from "../config/index";
import { useGet } from "../hooks/api";
import { useQueryParam } from "../hooks/useQueryParam";
import { PageHeader } from "../components/page-header";
import Loader from "../components/loader";
import { AnnotationBtnExport } from "../components/annotation/btn-export-csv";
import InfiniteScroll from "react-infinite-scroll-component";

interface Props {
  collectionID: number;
  schemaID: number;
}

export const AnnotationSchemaDatatable: React.FC<Props> = (props: Props) => {
  const { collectionID, schemaID } = props;

  const { data, loading: annotationsLoading, fetch } = useGet<AnnotationModelFull[]>(
    `/collections/${collectionID}/schema/${schemaID}/annotations`,
    { limit: config.pagination_size, skip: 0 },
  );
  const { data: schema, loading: schemaLoading } = useGet<SchemaModelFull>(
    `/collections/${collectionID}/schema/${schemaID}`,
  );

  const [annotations, setAnnotations] = useState<Array<AnnotationModelFull>>([]);

  useEffect(() => {
    if (data) {
      setAnnotations((annotations) => annotations.concat(data || []));
    }
  }, [data]);

  useEffect(() => {
    setAnnotations([]);
  }, [collectionID, schemaID]);

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

          <div className="row page-title ">
            <div className="col d-flex justify-content-between">
              <h2>
                <i className="fas fa-vector-square mr-2"></i>
                {schema.nb_annotations}
                <span className="ml-2">"{schema.name}" annotations</span>
              </h2>
              <AnnotationBtnExport
                title={`Export annotations in CSV`}
                filename={`${schema.collection.name} - ${schema.name}.csv`}
                schema={schema}
              />
            </div>
          </div>
        </>
      )}
      {(schemaLoading || annotationsLoading) && <Loader />}

      <InfiniteScroll
        dataLength={annotations.length}
        next={async () => {
          await fetch({ limit: config.pagination_size, skip: annotations.length });
        }}
        scrollableTarget={document.querySelector("main")}
        hasMore={data && data.length === 0 ? false : true}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <table className="table table-hover annotations-table">
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
                return (
                  <tr key={a.id}>
                    <th scope="row">
                      <img
                        src={getAnnotationDetailUrl(a)}
                        alt={a.image.name}
                        title={`Detail image for annotation ${a.order ? a.order : a.id}`}
                      />
                    </th>
                    <td>
                      <Link to={`/collections/${collectionID}/images/${a.image.id}?annotation=${a.id}`}>
                        {a.image.name}
                      </Link>
                    </td>
                    {headers.map((f: string, i: number) => (
                      <td key={i}>
                        <span className="annotation value">{a.data[f] || ""}</span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </InfiniteScroll>
    </>
  );
};
