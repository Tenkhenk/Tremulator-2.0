import React, { useContext, useState } from "react";
import { usePost } from "../../hooks/api";
import { CollectionModelFull, ImageModel } from "../../types/index";
import { AppContext } from "../../context/app-context";
import Loader from "./../loader";

interface Props {
  onUploaded: () => void;
  collection: CollectionModelFull;
}
const ImageIiifPresentationUpload: React.FC<Props> = (props: Props) => {
  const { collection, onUploaded } = props;

  const { setAlertMessage } = useContext(AppContext);
  const [save, { loading }] = usePost<{ url: string }, ImageModel[]>(
    `/collections/${collection.id}/images/iiif_presentation`,
  );

  const [url, setUrl] = useState<string>("");

  return (
    <>
      <div className="modal-body">
        {loading && <Loader />}
        {!loading && (
          <div className="fromGroup m-2">
            <label htmlFor="name">IIIF Manifest url</label>
            <input className="form-control" id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button
          className="btn btn-primary"
          disabled={url.length === 0 || loading}
          onClick={async (e) => {
            try {
              const downloadedImages = await save({ url });
              setAlertMessage({
                message: `${downloadedImages?.length || 0} images were downloaded`,
                type: "success",
              });
            } catch (error) {
              setAlertMessage({ message: `Error in uploading image  ${error}`, type: "warning" });
            } finally {
              if (onUploaded) onUploaded();
            }
          }}
        >
          <i className="fas fa-upload"></i>
          Upload
        </button>
      </div>
    </>
  );
};
export default ImageIiifPresentationUpload;
