import React, { useState } from "react";
import Form from "@rjsf/bootstrap-4";
import { JsonSchemaForm } from "../../types";

export const JsonSchemaPreview: React.FC<JsonSchemaForm> = (props: JsonSchemaForm) => {
  const { ui, schema } = props;

  // State for the form value
  const [value, setValue] = useState<any>({});

  return (
    <div className="preview position-sticky annotation">
      <h4>Preview</h4>
      <Form schema={schema || {}} uiSchema={ui || {}} onChange={(e) => setValue(e.formData)} formData={value}>
        <div className="form-group text-right"></div>
      </Form>
    </div>
  );
};
