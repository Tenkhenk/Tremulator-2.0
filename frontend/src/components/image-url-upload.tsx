import React, { useContext, useEffect, useState } from "react";
import { usePost } from "../hooks/api";
import {CollectionFullType, ImageType} from "../types/index"
import urlRegexpSafe from "url-regex-safe";
import { AppContext } from "../context/app-context";
import { useHistory } from "react-router";
interface Props {
    collection:CollectionFullType
}
const ImageURLUpload: React.FC<Props> = (props:Props) => {
    const {collection} = props; 
    const history = useHistory();
    const {setAlertMessage} = useContext(AppContext);
    const [imagesURLsText, setImagesURLsText] = useState<string>("");
    const [imagesURLs, setImagesURLs] = useState<string[]>([]);
    const [postImageURLs, {data:downloadedImages, loading}] = usePost<{urls:string[]},ImageType[]>(`/collections/${collection.id}/images/download`)

    useEffect(()=>{
        const urls = imagesURLsText.match(urlRegexpSafe({strict:true}));
        if (urls)
            setImagesURLs(urls);
    },[imagesURLsText])
    useEffect(()=>{
        if (downloadedImages){
            setAlertMessage({message:`${downloadedImages?.length || 0} images were downloaded from the ${imagesURLs.length} URLs you uploaded`, type:"success"});
            history.push(`/collections/${collection.id}`)
        }
    },[downloadedImages,imagesURLs,setAlertMessage,history,collection]);

    return <form>
                <div className="fromGroup m-2">
                    <label htmlFor="name">Copy/paste Image URLs</label>
                    <textarea className="form-control" id='imagesURLs' value={imagesURLsText} 
                            onChange={(e) => setImagesURLsText(e.target.value)}></textarea>
                </div>
                <div className="fromGroup m-2">
                    <button className="btn btn-primary" disabled={imagesURLs.length === 0 || loading} 
                        onClick={async (e)=>{
                            e.preventDefault();
                            if (imagesURLs.length > 0){
                                await postImageURLs({urls:imagesURLs}).catch(error => {setAlertMessage({message:`Error in uploading image URLs ${error}`, type:"warning"})})
                            }
                        }}>
                        {loading && <i className="fa fa-spinner fa-spin mr-1"></i>}
                        Upload{loading && "ing"} {imagesURLs.length} URL{imagesURLs.length>1 && "s"}
                    </button>
                </div>
                <div className="fromGroup m-2">Note that only URLs pointing to image file format will be processed.</div>
            </form>
};
export default ImageURLUpload;