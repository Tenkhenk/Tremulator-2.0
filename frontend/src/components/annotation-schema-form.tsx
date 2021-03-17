import React, { useContext, useEffect, useState } from "react";
import { usePost, usePut } from "../hooks/api";
import { SchemaType, NewSchemaType } from "../types/index";
import { AppContext } from "../context/app-context";

interface FormProps {
  schema?: SchemaType | null;
  saveSchema: (schema: SchemaType | NewSchemaType) => void;
  loading: boolean;
}
const AnnotationSchemaForm: React.FC<FormProps> = (props: FormProps) => {
  const { schema, saveSchema, loading } = props;
  const [newSchema, setNewSchema] = useState<SchemaType | NewSchemaType>({ name: "", schema: {} });
  const [schemaText, setSchemaText] = useState<string>("{}");
  const [schemaValid, setSchemaValid] = useState<boolean>(true);
  // validate schema format
  useEffect(() => {
    try {
      JSON.parse(schemaText);
      setSchemaValid(true);
    } catch {
      setSchemaValid(false);
    }
  }, [schemaText]);

  // init from schema if exists
  useEffect(() => {
    if (schema) {
      setNewSchema(schema);
      setSchemaText(JSON.stringify(schema.schema));
    }
  }, [schema]);

  return (
    <>
      <div className="fromGroup row">
        <label htmlFor="schema.name" className="col-sm-2 col-form-label">
          Name
        </label>
        <div className="col-sm-6">
          <input
            className="form-control"
            value={newSchema.name}
            type="text"
            id="schema.name"
            onChange={(e) => setNewSchema({ ...newSchema, name: e.target.value })}
          />
        </div>
      </div>
      <div className="fromGroup row">
        <label htmlFor="schema.schema" className="col-sm-2 col-form-label">
          Description
        </label>
        <div className="col-sm-6">
          <textarea
            className="form-control"
            id="schema.schema"
            value={schemaText}
            onChange={(e) => {
              setSchemaText(e.target.value);
            }}
          ></textarea>
          {!schemaValid && "This schema is not a valid json object"}
        </div>
      </div>
      {/*  warning on schema modification */}
      {schema && (
        <div className="fromGroup row">
          <label htmlFor="schema.save" className="col-sm-8">
            <i className="fas fa-exclamation-triangle ml-1"></i>
            If you change the schema after having started annotating, some annotation data fields might be lost.
          </label>
        </div>
      )}
      <div className="fromGroup row">
        <div className="col-sm-8">
          <button
            className="btn btn-primary col-sm-2"
            onClick={async () => {
              if (schemaValid && newSchema.name !== "") {
                const schemaObject = JSON.parse(schemaText);
                saveSchema({ ...newSchema, schema: schemaObject });
              }
            }}
            disabled={newSchema.name === "" && !schemaValid}
          >
            {loading ? "loading..." : "save"}
          </button>
        </div>
      </div>
    </>
  );
};

interface CreationProps {
  collectionID: number;
  onSaved?: (newSchema: SchemaType) => void;
}
export const AnnotationSchemaCreationForm: React.FC<CreationProps> = (props: CreationProps) => {
  const { collectionID, onSaved } = props;
  const { setAlertMessage } = useContext(AppContext);

  const [postSchema, { loading }] = usePost<NewSchemaType, SchemaType>(`/schema/${collectionID}/schema/`);
  const createSchema = async (newSchema: NewSchemaType) => {
    // create by post
    try {
      const createdSchema = await postSchema(newSchema);
      if (createdSchema) {
        setAlertMessage({ message: `Schema ${createdSchema.name} created.`, type: "success" });
        if (onSaved) onSaved(createdSchema);
      }
    } catch (error) {
      setAlertMessage({ message: `Error when creating schema: ${error}`, type: "warning" });
    }
  };

  return <AnnotationSchemaForm saveSchema={createSchema} loading={loading} />;
};

interface EditionProps {
  collectionID: number;
  schema: SchemaType;
  onSaved?: (newSchema: SchemaType) => void;
}
export const AnnotationSchemaEditionForm: React.FC<EditionProps> = (props: EditionProps) => {
  const { schema, collectionID, onSaved } = props;
  const { setAlertMessage } = useContext(AppContext);

  const [putSchema, { loading }] = usePut<SchemaType>(`/schema/${collectionID}/schema/${schema.id}`);

  const updateSchema = async (updatedSchema: SchemaType) => {
    // update by put
    try {
      await putSchema(updatedSchema);
      setAlertMessage({ message: `Schema ${updatedSchema.name} updated.`, type: "success" });
      if (onSaved) onSaved(updatedSchema);
    } catch (error) {
      setAlertMessage({ message: `Error when updating schema: ${error}`, type: "warning" });
    }
  };

  // update new scheam after creation (with id)

  return (
    <AnnotationSchemaForm
      schema={schema}
      saveSchema={(s: SchemaType | NewSchemaType) => updateSchema(s as SchemaType)}
      loading={loading}
    />
  );
};
