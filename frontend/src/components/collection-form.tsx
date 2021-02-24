import React, { FormEvent, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import {usePut, usePost, useGet} from "../hooks/api";
import {Collection, NewCollection} from "../types/index";


interface Props {
    collection: Collection|NewCollection;
    setCollection: (collection:Collection|NewCollection) => void;
    submit: (e:FormEvent) => void;
    loading: boolean;
    error: Error | null;
}


export const CollectionForm: React.FC<Props> = (props:Props) => {
    const {collection, setCollection, submit, loading, error } = props;

    return <form onSubmit={submit}>
        collection name <input value={collection.name} type='text' id='name' onChange={(e) => setCollection({...collection, name:e.target.value})}/>
        collection description <input value={collection.description} type='text' id='description' onChange={(e) => setCollection({...collection, description: e.target.value})}/>
        <button type='submit' disabled={collection.name === ""}>{loading ? "loading..." : "create"}</button>
        {error && error.message}
        </form>;
};