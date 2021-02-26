import React, { useContext, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { AppContext } from "../context/app-context";
import {useGet} from "../hooks/api";
import {CollectionFullType, CollectionType, ImageType} from "../types/index";
import ImageUpload from '../components/image-upload';

interface Props {
    id:string
}


export const Collection: React.FC<Props> = (props:Props) => {
const {id} = props;
const {setAlertMessage} = useContext(AppContext);
const history = useHistory();
const [collection, setCollection] = useState<CollectionFullType|null>();
const {data:getCollection, loading: loading, error: error} = useGet<CollectionFullType>(`/collections/${id}`);
useEffect(()=>{
    if (getCollection)
        setCollection(getCollection);
}, [getCollection])
useEffect(()=>{
    if (error)
        setAlertMessage({message:error.message, type:"warning"})
}, [error])

const thumbnailURL= (iiifURL:string) => iiifURL.split('/').slice(0,-1).join('/')+'/full/70,/0/default.jpg'

return <div className="container-fluid">
        {collection && <>
            <div className="row">
                <h1 className="col-12">{collection.name}</h1>
            </div>
            <div className="row">
                <h3 className="col-4">{collection.images.length} Pictures <button className='btn btn-primary btn-sm'>
                        <i className="far fa-plus-square  fa-2x" aria-label="add a picture" title="add a picture"></i>
                    </button></h3>
            </div>
            <div className="row">
                {collection.images.map((i:ImageType) => <div key={i.id}>{i.name} - {i.url} <img src={thumbnailURL(i.url)}/></div>)}
            </div>
            <div className="row">
                <ImageUpload collection={collection}></ImageUpload>
            </div>
            
        </>}
    </div>;
};