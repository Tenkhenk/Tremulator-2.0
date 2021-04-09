import React, { useContext } from "react";
import axios from "axios";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { AnnotationModelFull, SchemaModelFull } from "../../types";
import { config } from "../../config";
import { getServerUrl, getAnnotationDetailUrl } from "../../utils";
import { useExportToCsv } from "../../hooks/export-csv";

// Props definition
interface Props {
  filename: string;
  schema: SchemaModelFull;
  title: string;
}

export const AnnotationBtnExport: React.FC<Props> = (props: Props) => {
  const { filename, schema, title } = props;
  const [exportFn, { loading, progress, error }] = useExportToCsv();
  const { oidcUser } = useContext(AuthenticationContext);

  async function exportData(page: number): Promise<Array<any>> {
    const response = await axios({
      method: "GET",
      params: { skip: (page - 1) * config.pagination_size, limit: config.pagination_size },
      url: `${config.api_path}/collections/${schema.collection.id}/schema/${schema.id}/annotations`,
      responseType: "json",
      headers: oidcUser ? { Authorization: `${oidcUser.token_type} ${oidcUser.access_token}` } : {},
    });
    return response.data.map((row: AnnotationModelFull) => {
      let schemaData: { [key: string]: any } = {};
      Object.keys(schema.schema.properties).forEach((field: string) => {
        schemaData[field] = row.data[field];
      });
      return {
        id: row.order ? row.order : row.id,
        url: getServerUrl() + getAnnotationDetailUrl(row),
        ...schemaData,
        collection: row.schema.collection_id,
        schema: row.schema.id,
        image: row.image.id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
  }

  return (
    <button
      title={error ? error.message : title}
      className={`btn btn-link export-btn ${loading ? "loading" : ""} ${error ? "error" : ""}`}
      style={loading ? { opacity: progress / 100 } : {}}
      onClick={() => exportFn(exportData, filename)}
    >
      <i className="fas fa-file-csv"></i>
    </button>
  );
};
