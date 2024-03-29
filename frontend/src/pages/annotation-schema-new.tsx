import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/app-context";
import { CollectionModelFull } from "../types";
import { Link, useHistory } from "react-router-dom";
import { useGet, usePost } from "../hooks/api";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { JsonSchemaEditor } from "../components/schema/editor";
import { JsonSchemaPreview } from "../components/schema/preview";
import { SchemaData, SchemaModel } from "../types";
import { config } from "../config";

interface NewProps {
  collectionID: string;
}

export const AnnotationSchemaNew: React.FC<NewProps> = (props: NewProps) => {
  const { collectionID } = props;

  // hooks
  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);
  // data hooks
  const { data: collection, loading, error } = useGet<CollectionModelFull>(`/collections/${collectionID}`);
  const [create, { loading: createLoading }] = usePost<SchemaData, SchemaModel>(`/collections/${collectionID}/schema`);

  // States
  const [schemaForm, setSchemaForm] = useState<SchemaData | null>(null);

  // When collectionId changed
  //  => we reset the schema
  useEffect(() => {
    const colorIndex = (collection?.schemas?.length || 0) % config.schema_colors.length;
    setSchemaForm({ name: "", color: config.schema_colors[colorIndex], schema: {}, ui: {} });
  }, [collection]);

  // When error happend on loading the collection
  //  => set the alert
  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error, setAlertMessage]);

  return (
    <>
      {(loading || createLoading) && <Loader />}
      {collection && (
        <>
          <PageHeader title={`${collection.name}: New annotation schema`}>
            <h1>
              <Link to={`/collections/${collection.id}`}>{collection.name}</Link>
            </h1>
          </PageHeader>

          <div className="container-fluid">
            <div className="row page-title">
              <div className="col">
                <h2>Schema annotation creation</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <JsonSchemaEditor
                  value={schemaForm ? schemaForm : undefined}
                  onChange={(e) => setSchemaForm(e)}
                  onSubmit={async (e) => {
                    try {
                      await create(e);
                      setAlertMessage({ message: `Annotation schema saved`, type: "success" });
                      history.push(`/collections/${collectionID}/edit`);
                    } catch (error) {
                      setAlertMessage({
                        message: `Error when saving your annotation schema "${error?.message}"`,
                        type: "warning",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-4">
                <JsonSchemaPreview schema={schemaForm ? schemaForm.schema : {}} ui={schemaForm ? schemaForm.ui : {}} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
