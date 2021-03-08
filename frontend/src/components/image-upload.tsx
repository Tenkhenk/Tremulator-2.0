import React, { ChangeEvent, FC, useContext, useEffect, useState, useMemo, CSSProperties } from "react";
import { AppContext, AppContextType } from "../context/app-context";
import {useDropzone} from 'react-dropzone';
import {usePost} from '../hooks/api';
import { CollectionFullType, ImageType } from "../types";
import { useHistory } from "react-router-dom";

const baseStyle:CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

interface Props {
    collection:CollectionFullType
}
const ImageUpload: React.FC<Props> = (props:Props) => {
    const {collection} = props;
    const {setAlertMessage} = useContext(AppContext);
    const history = useHistory();
    const [files, setFiles] = useState<File[]>([]);
    const [uploadPost, { loading, error, data }] = usePost<FormData,ImageType[]>(`/collections/${collection.id}/images/upload`)
    const {getRootProps, getInputProps, open, acceptedFiles,isDragActive, isDragAccept, isDragReject} = useDropzone({
        // Disable click and keydown behavior
        noClick: true,
        noKeyboard: true,
        accept:  'image/jpeg, image/png'
    });
    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
      }), [
        isDragActive,
        isDragReject,
        isDragAccept
      ]);
    useEffect(()=> setFiles([...files, ...acceptedFiles]), [acceptedFiles]);
    useEffect(() => {
        if (error)
            setAlertMessage({message:`Error when uploading ${error.message}`, type:"danger"});
        if (data){
            setAlertMessage({message:`Created ${data.length} images in the collection "${collection.name}"`, type:"success"})
            // TODO: replace this after integrated the modal system
            history.push(`/collections/${collection.id}`)
        };
        }, [error,data]);

    const upload = async () => {
        const formData = new FormData();
        files.forEach(f => formData.append("files",f,f.name));
        await uploadPost(formData);
    }
    

  return (
    <div className="container">
      <div {...getRootProps({className: 'dropzone', style})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <button type="button" onClick={open}>
          Open File Dialog
        </button>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files.map(file => (
            <li key={file.name}>
            {file.name} - {file.size} bytes
            </li>
        ))}</ul>
      </aside>
      <button className='btn btn-primary' onClick={upload}>Upload</button>
    </div>
  );
}


export default ImageUpload