import React, { useContext, useEffect, useState } from "react";
import { AnnotationSchemaEditionForm } from "../components/annotation-schema-form";
import { AppContext } from "../context/app-context";
import { CollectionFullType, SchemaType } from "../types";
import { useGet } from "../hooks/api";
import Loader from "../components/loader";

interface props {
  collectionID: string;
  schemaID: string;
}
export const AnnotationSchemaEdit: React.FC<props> = (props: props) => {
  const { collectionID, schemaID } = props;

  // reset context
  const { setCurrentCollection, setCurrentImageID } = useContext(AppContext);
  const { data: getCollection, loading } = useGet<CollectionFullType>(`/collections/${collectionID}`);
  const [schema, setSchema] = useState<SchemaType | null>(null);
  useEffect(() => {
    setCurrentImageID(null);
    if (getCollection) {
      setCurrentCollection(getCollection);
      const s = getCollection.schemas.find((s) => s.id.toString() === schemaID);
      if (s) setSchema(s);
    }
  }, [getCollection, schemaID, setCurrentCollection, setCurrentImageID]);

  return (
    <>
      {loading && <Loader />}
      {!loading && getCollection && schema && (
        <AnnotationSchemaEditionForm collectionID={+collectionID} schema={schema} />
      )}
    </>
  );
};
