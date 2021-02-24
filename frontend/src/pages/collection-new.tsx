import React, { FormEvent, useState } from "react";
import {useHistory} from "react-router-dom";
import {usePost} from "../hooks/api";
import {Collection, NewCollection} from "../types/index";
import { CollectionForm } from "../components/collection-form";

interface Props {
}


export const CollectionNew: React.FC<Props> = (props:Props) => {

const history = useHistory();
const [newCollection, setCollection] = useState<Collection|NewCollection>({name:"", description:""});
const [postCollection, { loading: loading, error: error, data: postData }] = usePost<NewCollection,Collection>("/collections");
const submit = async (e:FormEvent)=> {
    e.preventDefault();
    // create a new collection
    if (newCollection.name !== '') {
        await postCollection(newCollection);
        if (!error && postData)
            history.push(`/collections/${postData.id}/edit`)
    }
}


return <CollectionForm collection={newCollection} setCollection={setCollection} submit={submit} error={error} loading={loading} />;
};