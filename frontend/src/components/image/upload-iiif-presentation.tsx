import React, { useContext, useEffect, useState } from "react";
import urlRegexpSafe from "url-regex-safe";
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
      {loading && <Loader />}
      {!loading && (
        <form>
          <div className="fromGroup m-2">
            <label htmlFor="name">IIIF Presentation Manifest url</label>
            <input className="form-control" id="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="fromGroup m-2">
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
                  if (onUploaded) onUploaded();
                } catch (error) {
                  setAlertMessage({ message: `Error in uploading image  ${error}`, type: "warning" });
                }
              }}
            >
              Upload
            </button>
          </div>
        </form>
      )}
    </>
  );
};
export default ImageIiifPresentationUpload;
