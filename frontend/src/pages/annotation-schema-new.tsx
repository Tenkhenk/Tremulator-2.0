import React, { useContext, useEffect } from "react";
import { AnnotationSchemaCreationForm } from "../components/annotation-schema-form";
import { AppContext } from "../context/app-context";
import { CollectionFullType } from "../types";
import { useHistory } from "react-router-dom";
import { useGet } from "../hooks/api";

interface NewProps {
  collectionID: string;
}
export const AnnotationSchemaNew: React.FC<NewProps> = (props: NewProps) => {
  const { collectionID } = props;
  const history = useHistory();

  // reset context
  const { setCurrentCollection, setCurrentImageID } = useContext(AppContext);
  const { data: getCollection } = useGet<CollectionFullType>(`/collections/${collectionID}`);

  useEffect(() => {
    setCurrentCollection(getCollection);
    setCurrentImageID(null);
  }, [getCollection, setCurrentCollection, setCurrentImageID]);

  return (
    <AnnotationSchemaCreationForm
      collectionID={+collectionID}
      onSaved={(newSchema) => history.push(`/collections/${collectionID}/schemas/${newSchema.id}/edit`)}
    />
  );
};
