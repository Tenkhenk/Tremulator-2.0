import React, { FC, useContext, useEffect, useState } from "react";
import Form from "@rjsf/bootstrap-4";
import { omit } from "lodash";
import Loader from "../loader";
import { AnnotationType, NewAnnotationType, SchemaType } from "../../types";
import { AppContext } from "../../context/app-context";
import { usePost, usePut } from "../../hooks/api";

interface Props {
  collectionID: number;
  imageID: number;
  schemas: Array<SchemaType>;
  annotation: AnnotationType;
  onSaved?: () => void;
  onCancel?: () => void;
}
export const AnnotationForm: FC<Props> = (props: Props) => {
  //props
  const { annotation, collectionID, imageID, onCancel, onSaved, schemas } = props;

  const { setAlertMessage } = useContext(AppContext);
  // The selected schema
  const [schema, setSchema] = useState<SchemaType | null>(null);
  // Hook to create the data
  const [create, { loading: createLoading }] = usePost<NewAnnotationType, AnnotationType>(
    `/collections/${collectionID}/images/${imageID}/annotations`,
  );
  // Hook to update the data
  const [update, { loading: updateLoading }] = usePut<NewAnnotationType>(
    `/collections/${collectionID}/images/${imageID}/annotations/${annotation.id}`,
  );

  useEffect(() => {
    if (annotation.id > 0) {
      const annotationSchema = schemas.find((item) => item.id === annotation.schemaId);
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
      {createLoading || (updateLoading && <Loader />)}
      <div className="row">
        <div className="col">
          <h3>
            <i className="fas fa-vector-square mr-1"></i>
            {annotation.id < 0 ? "New annotation" : `Annotation #${annotation.id}`}
          </h3>
        </div>
      </div>

      {annotation.id < 0 && schemas.length > 1 && (
        <div className="row">
          <div className="col">
            <label htmlFor="schema">Select a schema</label>
            <select
              id="schema"
              onChange={(e) => setSchema(schemas.find((item) => "" + item.id === e.target.value) || null)}
            >
              {schemas.map((schema) => (
                <option key={schema.id} value={schema.id}>
                  {schema.name}
                </option>
              ))}
            </select>
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
                  if (annotation.id < 0) {
                    const data = await create(
                      { ...omit(annotation, ["id"]), data: e.formData },
                      { schemaId: schema.id },
                    );
                    setAlertMessage({ message: `Annotation created`, type: "success" });
                  } else {
                    console.log({ ...omit(annotation, ["schemaId"]), data: e.formData });
                    await update({ ...omit(annotation, ["schemaId"]), data: e.formData });
                    setAlertMessage({ message: `Annotation updated`, type: "success" });
                  }
                  if (onSaved) onSaved();
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
  );
};
