import React, { FormEvent, useContext, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import {usePut, usePost, useGet, useDelete} from "../hooks/api";
import {CollectionType, CollectionFullType} from "../types/index";
import {omit} from "lodash";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { AppContext } from "../context/app-context";


interface Props {
    id: string;
}


export const CollectionEdit: React.FC<Props> = (props:Props) => {

    // state management
    const {id} = props;
    const history= useHistory();
    const {setAlertMessage} = useContext(AppContext);
    const {oidcUser} = useContext(AuthenticationContext);
    const {data: getCollection, loading: getLoading, error: getError } = useGet<CollectionFullType>(`/collections/${id}`);
    const [collection, setCollection] = useState<CollectionType|null>(null);
    const [putCollection, { loading: putLoading, error: putError }] = usePut<CollectionType, CollectionType>(`/collections/${id}`);
    const [deleteCollection, { loading: delLoading, error: delError }] = useDelete<CollectionType>(`/collections/${id}`);

    // initialize collection
    useEffect(() => {
        if (getCollection){
            setCollection(omit(getCollection, ["schemas","images","users", "owner"]) as CollectionType)
        }
    },[getCollection])


    // actions
    const update = async (e:FormEvent)=> {
        e.preventDefault();

        // modify an existing collection
        if (collection && collection.name !== '') {
            await putCollection(collection);
            if (putError)
                setAlertMessage({message:`Error when saving your collection "${putError.message}"`, type:"warning"})
            else
                setAlertMessage({message:`Collection saved`, type:"success"})

        }
    }
    const del = async (e:FormEvent)=> {
        e.preventDefault();
        await deleteCollection();
        if (delError)
            setAlertMessage({message:`Error when deleting your collection "${delError.message}"`, type:"warning"})
        else{
            setAlertMessage({message:`Collection deleted`, type:"success"})
            history.push("/collections")
        }
    };

    const isOwner = getCollection && oidcUser && oidcUser.profile.email === getCollection.owner.email;

    return <>
        {getError && getError.message}
        {getLoading && "loading collection..."}
        {!getError && collection &&
        <>
            <h1>{collection.name}</h1>
            {putError && putError.message}
            <form onSubmit={update}>
                <div className="fromGroup row">
                    <label htmlFor="name" className="col-sm-2 col-form-label">Name</label>
                    <div className="col-sm-6">
                        <input className="form-control" value={collection.name} type='text' id='name' onChange={(e) => setCollection({...collection, name:e.target.value})}/>
                    </div>
                </div>
                <div className="fromGroup row">
                    <label htmlFor="name" className="col-sm-2 col-form-label">Description</label>
                    <div className="col-sm-6">
                        <textarea className="form-control" id='description' value={collection.description} onChange={(e) => setCollection({...collection, description: e.target.value})}></textarea>
                    </div>
                </div>
                <div className="fromGroup row">
                    <div className="col-sm-8">
                        <button className="btn btn-primary col-sm-2" type='submit' disabled={collection.name === ""}>{putLoading ? "loading..." : "save"}</button>
                    </div>
                </div>
            </form>
            <form onSubmit={del}>
                <div className="fromGroup row">
                    <div className="col-sm-12 mt-5">
                        <h3><i className="fas fa-exclamation-triangle"></i> Danger Zone</h3>
                        <p>If you delete a collection all the related images and annotations will be deleted too.</p>
                    </div>
                </div>
                <div className="fromGroup row">
                    <div className="col-sm-12">
                        <button className="btn btn-secondary" type='submit' disabled={collection.id === -1}>{putLoading ? "loading..." : "delete this collection"}</button>
                    </div>
                </div>
            </form>  
        </>}
    </>
};