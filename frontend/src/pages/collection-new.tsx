import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import Form from "@rjsf/bootstrap-4";
import { AppContext } from "../context/app-context";
import { usePost } from "../hooks/api";
import { collectionSchemaForm, CollectionData, CollectionModel } from "../types/index";
import { PageHeader } from "../components/page-header";
import Loader from "../components/loader";

interface Props {}

export const CollectionNew: React.FC<Props> = (props: Props) => {
  const history = useHistory();

  const { setAlertMessage } = useContext(AppContext);
  const [collection, setCollection] = useState<CollectionData>({ name: "", description: "" });
  const [postCollection, { loading }] = usePost<CollectionData, CollectionModel>("/collections");

  const submit = async (item: CollectionData) => {
    try {
      const createdCollection = await postCollection(item);
      setAlertMessage({ message: `Collection "${createdCollection.name}" created`, type: "success" });
      history.push(`/collections/${createdCollection.id}`);
    } catch (error) {
      setAlertMessage({ message: `Error when creating collection "${error.message}" created`, type: "warning" });
      // Keep it in case of errors
      setCollection(item);
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <>
          <PageHeader title={`Create a collection`}>
            <h1>Create a collection</h1>
          </PageHeader>

          <div className="container">
            <div className="row page-title">
              <div className="col">
                <h2>Create a collection</h2>
              </div>
            </div>
            <div className=" row">
              <div className="col">
                <Form
                  schema={collectionSchemaForm.schema}
                  uiSchema={collectionSchemaForm.ui}
                  formData={collection}
                  onSubmit={(e) => submit(e.formData)}
                >
                  <div className="form-group text-right">
                    <button type="submit" className="btn btn-primary  ml-2">
                      Submit
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
