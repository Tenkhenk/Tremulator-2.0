import React from "react";
import Form from "@rjsf/bootstrap-4";
import { schemaSchemaForm, NewSchemaType } from "../../types";

/**
 * Translate the schema (ie. json schema + ui) to fields for the form.
 */
function schemaToForm(value: NewSchemaType): { name: string; fields: Array<any> } {
  let form: any = { name: value.name, color: value.color, fields: [] };

  if (value.schema && value.schema.properties) {
    Object.keys(value.schema.properties).forEach((field) => {
      const def = value.schema.properties[field];

      const formField: any = {
        name: field,
        required: value.schema.required.includes(field),
        type: value.ui[field] ? value.ui[field]["ui:widget"] : def.type,
      };

      // Handle special case for select
      if (def.type === "string" && def.enum) {
        formField.type = "select";
        formField.values = def.enum;
      }

      // Handle special case for range
      if (def.type === "range") {
        formField.type = "number";
        formField.min = def.min;
        formField.max = def.max;
      }

      form.fields.push(formField);
    });
  }
  return form;
}

/**
 * Translate the form value (ie. fields) to schema (ie. json schema + ui)
 */
function formToSchema(form: { name: string; color: string; fields: Array<any> }): NewSchemaType {
  // init schema
  let schema: any = {
    name: form.name,
    color: form.color,
    schema: {
      type: "object",
      required: [],
      properties: {},
    },
    ui: {},
  };

  if (form.fields) {
    // for each field we fill the schema and ui (if needed)
    form.fields.forEach((field) => {
      let schemaField: any = { title: field.name || "" };
      switch (field.type) {
        case "textarea":
          schemaField.type = "string";
          schemaField.default = "";
          schema.ui[field.name] = { "ui:widget": "textarea" };
          break;
        case "select":
          schemaField.type = "string";
          schemaField.enum = field.values && field.values.length > 0 ? field.values : ["add a value"];
          break;
        case "range":
          schemaField.type = "number";
          schemaField.minimum = field.min;
          schemaField.maximum = field.max;
          schema.ui[field.name] = { "ui:widget": "range" };
          break;
        default:
          schemaField.type = field.type;
          break;
      }
      schema.schema.properties[field.name || ""] = schemaField;
      if (field.required === true) {
        schema.schema.required.push(field.name);
      }
    });
  }
  return schema;
}

interface Props {
  value?: NewSchemaType;
  onChange: (value: NewSchemaType) => void;
  onSubmit: (value: NewSchemaType) => void;
}

export const JsonSchemaEditor: React.FC<Props> = (props: Props) => {
  const { onChange, onSubmit, value } = props;
  return (
    <div className="container-fluid">
      <div className="row">
        <Form
          schema={schemaSchemaForm.schema}
          uiSchema={schemaSchemaForm.ui}
          formData={value ? schemaToForm(value) : {}}
          onChange={(e) => onChange(formToSchema(e.formData))}
          onSubmit={(e) => onSubmit(formToSchema(e.formData))}
        >
          <div className="form-group text-right">
            <button type="submit" className="btn btn-primary  ml-2">
              Submit
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};
