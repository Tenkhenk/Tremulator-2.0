import React, { useContext, useEffect, useState, useMemo, CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import { uniqBy } from "lodash";
import { CollectionModelFull, ImageModel } from "../../types";
import { AppContext } from "../../context/app-context";
import { usePost } from "../../hooks/api";
import { config } from "../../config";
import Loader from "./../loader";
import { formatBytes } from "../../utils";

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
    } catch (error) {
      setAlertMessage({ message: `Error when uploading ${error.message}`, type: "danger" });
    } finally {
      if (onUploaded) onUploaded();
    }
  };

  const totalFiles = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <>
      <div className="modal-body">
        {loading && <Loader />}
        {!loading && (
          <>
            <div {...getRootProps({ className: "dropzone", style })}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here</p>
              <button type="button" onClick={open}>
                Open File Dialog
              </button>
            </div>
            {files.length > 0 && (
              <aside className="mt-2">
                <h4>
                  {files.length} Files - {formatBytes(totalFiles)}
                </h4>
                {totalFiles > config.max_upload_size && (
                  <p className="error">Total size is upper the limit ({formatBytes(config.max_upload_size)})</p>
                )}
                <div style={{ maxHeight: "200px", overflowY: "scroll" }}>
                  {files.map((file, index) => (
                    <div key={file.name}>
                      <span>
                        {file.name} - {formatBytes(file.size)}
                      </span>
                      <button
                        className="btn btn-lg btn-link"
                        title="Remove from the selection"
                        onClick={() => {
                          setFiles((files) => files.filter((f, i) => i !== index));
                        }}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-primary" onClick={upload} disabled={loading || totalFiles > config.max_upload_size}>
          <i className="fas fa-upload"></i>
          Upload
        </button>
      </div>
    </>
  );
};

export default ImageUpload;
