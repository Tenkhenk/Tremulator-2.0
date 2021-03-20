import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/app-context";
import { Link, useHistory } from "react-router-dom";
import { pick } from "lodash";
import { useGet, usePut } from "../hooks/api";
import Loader from "../components/loader";
import { PageHeader } from "../components/page-header";
import { JsonSchemaEditor } from "../components/schema/editor";
import { JsonSchemaPreview } from "../components/schema/preview";
import { NewSchemaType, SchemaType, SchemaFullType } from "../types";

interface props {
  collectionID: number;
  schemaID: number;
}
export const AnnotationSchemaEdit: React.FC<props> = (props: props) => {
  const { collectionID, schemaID } = props;

  // hooks
  const history = useHistory();
  const { setAlertMessage } = useContext(AppContext);

  // data hooks
  const { data: schema, loading, error } = useGet<SchemaFullType>(`/collections/${collectionID}/schema/${schemaID}`);
  const [update, { loading: updateLoading }] = usePut<SchemaType>(`/collections/${collectionID}/schema/${schemaID}`);

  // States
  const [schemaForm, setSchemaForm] = useState<NewSchemaType | null>(null);

  // When schema changed
  //  => we reset the one for the form
  useEffect(() => {
    setSchemaForm(pick(schema, ["name", "schema", "ui", "color"]) as NewSchemaType);
  }, [schema]);

  // When error happend on loading the schema
  //  => set the alert
  useEffect(() => {
    if (error) setAlertMessage({ message: error.message, type: "warning" });
  }, [error, setAlertMessage]);

  return (
    <>
      {loading || (updateLoading && <Loader />)}
      {schema && (
        <>
          <PageHeader title={`${schema.collection.name}: Edit schema ${schema.name}`}>
            <h1>
              <Link to={`/collections/${schema.collection.id}`}>{schema.collection.name}</Link>
            </h1>
          </PageHeader>

          <div className="container-fluid">
            <div className="row">
              <div className="col">
                <h2>Schema annotation : {schema.name}</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <JsonSchemaEditor
                  value={schemaForm ? schemaForm : undefined}
                  onChange={(e) => setSchemaForm(e)}
                  onSubmit={async (e) => {
                    try {
                      await update({ ...e, id: schemaID });
                      setAlertMessage({ message: `Annotation schema updated`, type: "success" });
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
