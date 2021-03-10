import React, { useContext, useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import ModalPortal from "../components/modal";
import { AppContext } from "../context/app-context";
import {useGet, useDelete} from "../hooks/api";
import { ImageFullType, CollectionFullType, ImageType} from "../types/index";
//leaflet IIIF
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {IIIFLayer} from '../components/iiif-layer';
import L from "leaflet";
import 'leaflet-iiif';


interface Props {
    collectionID:string,
    imageID: string
}


export const CollectionImage: React.FC<Props> = (props:Props) => {
    const {collectionID, imageID} = props;
    const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
    const {setAlertMessage, setCurrentImageID, currentCollection, setCurrentCollection} = useContext(AppContext);
    const history = useHistory();
    const {data:image, loading: imageLoading, error: imageError} = useGet<ImageFullType>(`/collections/${collectionID}/images/${imageID}`);
    const {data:collection, loading: collectionLoading, error: collectionError} = useGet<CollectionFullType>(`/collections/${collectionID}`);
    const [deleteImage] = useDelete<any>(`/collections/${collectionID}/images/${imageID}`);
    
    setCurrentImageID(imageID);
    useEffect(()=> {
        if (collection){
            setCurrentCollection(collection);
        }
    }, [collection])

    useEffect(()=>{
        if (imageError)
            setAlertMessage({message:imageError.message, type:"warning"})
        if (collectionError)
            setAlertMessage({message:collectionError.message, type:"warning"})
    }, [imageError, collectionError]);
    

    return <div className="container-fluid">
           
            {image && <>
                <div className="row">
                    <div className="col-3"><i className="fas fa-layout-wtf ml-3"></i>{image.annotations.length} annotations</div>
                    <div className="col-6 text-center">{image.name || image.url} <button className="btn" onClick={() => setNeedsConfirmation(true)}><i className="fas fa-trash-alt"></i></button></div>
                    <div className="col-3 text-right">
                        <i className="fas fa-sliders-h mr-2"></i>
                        <i className="fas fa-map mr-2"></i>
                        <i className="fas fa-expand"></i>
                    </div>
                </div>
                <div className="row">
                    {/* <img src={thumbnailURL(image.url)}/> */}
                    <MapContainer center={[0,0]} zoom={0} crs={L.CRS.Simple} scrollWheelZoom={true}>
                       <IIIFLayer url={image.url}/>
                    </MapContainer>
                </div>
                
                {needsConfirmation && <ModalPortal title="Confirmation needed" onClose={() => setNeedsConfirmation(false)}>
                    <div className="h5">
                        <div className="text-center">
                            <i className="far fa-question-circle fa-2x mb-3"></i><br/>
                            Do you really want to delete<br/>"{image.name}"{image.annotations.length >0 && <span> and the {image.annotations.length} associated annotations</span>}?
                        </div>
                        <div className="text-center mt-3">
                            <button className="btn btn-secondary" onClick={()=> setNeedsConfirmation(false)}>No <i className="fas fa-window-close ml-1"></i></button>
                            <button className="btn btn-danger ml-2" onClick={async ()=>{
                                await deleteImage().catch(error => setAlertMessage({message:error.message, type:"warning"})); 
                                setAlertMessage({message:"Image deleted successfully.", type:"success"});
                                setNeedsConfirmation(false);
                                history.push(`/collections/${collectionID}`)}}><i className="fas fa-trash-alt mr-1"></i> Yes</button>
                        </div>
                    </div>
                </ModalPortal>}
                
            </>}
            
        </div>;
};