import React, { FC, useContext, useEffect, useState } from "react";
import Form from "@rjsf/bootstrap-4";
import { omit } from "lodash";
import Loader from "../loader";
import { AnnotationModel, AnnotationData, SchemaModel } from "../../types";
import { AppContext } from "../../context/app-context";
import { usePost, usePut } from "../../hooks/api";

interface Props {
  collectionID: number;
  schemas: Array<SchemaModel>;
  annotation: AnnotationModel;
  onSaved?: (id: number) => void;
  onCancel?: () => void;
  withTitle?: boolean;
}
export const AnnotationForm: FC<Props> = (props: Props) => {
  //props
  const { annotation, collectionID, onCancel, onSaved, schemas, withTitle } = props;

  const { setAlertMessage } = useContext(AppContext);
  // The selected schema
  const [schema, setSchema] = useState<SchemaModel | null>(null);
  // Hook to create the data
  const [create, { loading: createLoading }] = usePost<AnnotationData, AnnotationModel>(
    `/collections/${collectionID}/images/${annotation.image_id}/annotations`,
  );
  // Hook to update the data
  const [update, { loading: updateLoading }] = usePut<AnnotationData>(
    `/collections/${collectionID}/images/${annotation.image_id}/annotations/${annotation.id}`,
  );

  useEffect(() => {
    if (annotation.id > 0) {
      const annotationSchema = schemas.find((item) => item.id === annotation.schema_id);
      if (annotationSchema) setSchema(annotationSchema);
      else {
        throw new Error("Schema not found in collection");
      }
    } else {
      setSchema(schemas[0]);
    }
  }, [schemas, annotation]);

  return (
    <>
      {(createLoading || updateLoading) && <Loader />}
      {!(createLoading || updateLoading) && (
        <>
          {(withTitle === undefined || withTitle === true) && (
            <div className="row">
              <div className="col">
                <h3>
                  <i className="fas fa-vector-square mr-1"></i>
                  {annotation.id < 0 ? "New annotation" : `Annotation #${annotation.id}`}
                </h3>
              </div>
            </div>
          )}

          {annotation.id < 0 && schemas.length > 1 && (
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <div className="form-group">
                    <select
                      id="schema"
                      className="custom-select"
                      onChange={(e) => setSchema(schemas.find((item) => "" + item.id === e.target.value) || null)}
                    >
                      {schemas.map((schema) => (
                        <option key={schema.id} value={schema.id}>
                          Schema: {schema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {schema && (
            <div className="row">
              <div className="col">
                <Form
                  schema={schema.schema}
                  uiSchema={schema.ui}
                  formData={annotation.data}
                  onSubmit={async (e) => {
                    try {
                      let data = omit({ ...annotation, data: e.formData }, [
                        "schema_id",
                        "image_id",
                        "created_at",
                        "updated_at",
                      ]);
                      if (annotation.id < 0) {
                        data = await create(data, {
                          schemaId: schema.id,
                        });
                        setAlertMessage({ message: `Annotation created`, type: "success" });
                      } else {
                        await update(data);
                        setAlertMessage({ message: `Annotation updated`, type: "success" });
                      }
                      if (onSaved) onSaved(data.id);
                    } catch (error) {
                      setAlertMessage({
                        message: `Error when creating annotation "${error?.message}" created`,
                        type: "warning",
                      });
                    }
                  }}
                >
                  <div className="form-group text-right">
                    <button
                      type="reset"
                      className="btn btn-secondary  ml-2"
                      onClick={() => {
                        if (onCancel) onCancel();
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary  ml-2">
                      Submit
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
