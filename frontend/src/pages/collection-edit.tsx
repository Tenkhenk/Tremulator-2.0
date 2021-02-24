import React, { FormEvent, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { CollectionForm } from "../components/collection-form";
import {usePut, usePost, useGet} from "../hooks/api";
import {Collection, NewCollection} from "../types/index";
import {pick} from "lodash";


interface Props {
    id: string;
}


export const CollectionEdit: React.FC<Props> = (props:Props) => {
const {id} = props;
const {data: getCollection, loading: getLoading, error: getError } = useGet<Collection>(`/collections/${id}`);
const [collection, setCollection] = useState<NewCollection>({name:"", description:""});
useEffect(() => {
    if (getCollection)
        setCollection(pick(getCollection, ['name', 'description']))
},[getCollection])

const [putCollection, { loading, error }] = usePut<NewCollection, NewCollection>(`/collections/${id}`);
const submit = async (e:FormEvent)=> {
    e.preventDefault();

    // modify an existing collection
    if (collection.name !== '') {
        await putCollection(collection);
    }
}

return <>
    {getError && getError.message}
    {getLoading && "loading collection..."}
    {!getError && <CollectionForm collection={collection} setCollection={setCollection} submit={submit} error={error} loading={loading} />}
</>
};