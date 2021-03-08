import React, { useContext, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import { AppContext } from "../context/app-context";
import {useGet} from "../hooks/api";
import { ImageFullType, CollectionFullType} from "../types/index";


interface Props {
    collectionID:string,
    imageID: string
}


export const CollectionImage: React.FC<Props> = (props:Props) => {
    const {collectionID, imageID} = props;
    const [image, setImage] = useState<ImageFullType|null>(null);
    const {setAlertMessage, setCurrentImageID, currentCollection, setCurrentCollection} = useContext(AppContext);
    const history = useHistory();
    const {data:getImage, loading: imageLoading, error: imageError} = useGet<ImageFullType>(`/collections/${collectionID}/images/${imageID}`);
    
    const {data:getCollection, loading: collectionLoading, error: collectionError} = useGet<CollectionFullType>(`/collections/${collectionID}`);
    
    setCurrentImageID(imageID);
    useEffect(()=> {
        if (getCollection){
            setCurrentCollection(getCollection);
        }
    }, [getCollection])
    useEffect(()=>{
        if (getImage){
            setImage(getImage);
        }
    }, [getImage]);
    useEffect(()=>{
        if (imageError)
            setAlertMessage({message:imageError.message, type:"warning"})
        if (collectionError)
            setAlertMessage({message:collectionError.message, type:"warning"})
    }, [imageError, collectionError]);


    const thumbnailURL= (iiifURL:string) => iiifURL.split('/').slice(0,-1).join('/')+'/full/full/0/default.jpg'

    return <div className="container-fluid">
           
            {image && <>
                <div className="row">
                    <div className="col-3"><i className="fas fa-layout-wtf ml-3"></i>{image.annotations.length} annotations</div>
                    <div className="col-6 text-center">{image.name || image.url}</div>
                    <div className="col-3 text-right">
                        <i className="fas fa-sliders-h mr-2"></i>
                        <i className="fas fa-map mr-2"></i>
                        <i className="fas fa-expand"></i>
                    </div>
                </div>
                <img src={thumbnailURL(image.url)}/>
            </>}
        </div>;
};