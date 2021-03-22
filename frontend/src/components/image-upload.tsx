import React, { useContext, useEffect, useState, useMemo, CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import { uniqBy } from "lodash";
import { CollectionModelFull, ImageModel } from "../types";
import { AppContext } from "../context/app-context";
import { usePost } from "../hooks/api";
import { config } from "../config";
import Loader from "./loader";

const baseStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

interface Props {
  collection: CollectionModelFull;
  onUploaded: () => void;
}
const ImageUpload: React.FC<Props> = (props: Props) => {
  const { collection, onUploaded } = props;

  const { setAlertMessage } = useContext(AppContext);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadPost, { loading }] = usePost<FormData, ImageModel[]>(`/collections/${collection.id}/images/upload`);
  const { getRootProps, getInputProps, open, acceptedFiles, isDragActive, isDragAccept, isDragReject } = useDropzone({
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true,
    accept: config.mime_types.join(","),
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  );
  useEffect(() => setFiles((prevFiles) => uniqBy(prevFiles.concat(acceptedFiles), (f) => f.name + f.size.toString())), [
    acceptedFiles,
  ]);

  const upload = async () => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f, f.name));
    try {
      const newImages = await uploadPost(formData);
      setAlertMessage({
        message: `Created ${newImages.length} images in the collection "${collection.name}"`,
        type: "success",
      });
      if (onUploaded) onUploaded();
    } catch (error) {
      setAlertMessage({ message: `Error when uploading ${error.message}`, type: "danger" });
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!loading && (
        <div className="container">
          <div {...getRootProps({ className: "dropzone", style })}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here</p>
            <button type="button" onClick={open}>
              Open File Dialog
            </button>
          </div>
          <aside>
            <h4>Files</h4>
            <ul style={{ maxHeight: "200px", overflowY: "scroll" }}>
              {files.map((file) => (
                <li key={file.name}>
                  {file.name} - {file.size} bytes
                </li>
              ))}
            </ul>
          </aside>
          <div className="text-center">
            <button className="btn btn-primary" onClick={upload}>
              {loading && <i className="fas mr-1 fa-spinner"></i>}
              Upload
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUpload;
