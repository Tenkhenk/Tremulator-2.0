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
const ImageURLUpload: React.FC<Props> = (props: Props) => {
  const { collection, onUploaded } = props;

  const { setAlertMessage } = useContext(AppContext);
  const [postImageURLs, { loading }] = usePost<{ urls: string[] }, ImageModel[]>(
    `/collections/${collection.id}/images/download`,
  );

  const [imagesURLsText, setImagesURLsText] = useState<string>("");
  const [imagesURLs, setImagesURLs] = useState<string[]>([]);

  useEffect(() => {
    const urls = imagesURLsText.match(urlRegexpSafe({ strict: true }));
    if (urls) setImagesURLs(urls);
  }, [imagesURLsText]);

  return (
    <>
      <div className="modal-body">
        {loading && <Loader />}
        {!loading && (
          <>
            <label htmlFor="name">Copy/paste Image URLs</label>
            <textarea
              className="form-control"
              id="imagesURLs"
              value={imagesURLsText}
              onChange={(e) => setImagesURLsText(e.target.value)}
            ></textarea>
            <div className="fromGroup m-2">Note that only URLs pointing to image file format will be processed.</div>
          </>
        )}
      </div>
      <div className="modal-footer">
        <button
          className="btn btn-primary"
          disabled={imagesURLs.length === 0 || loading}
          onClick={async (e) => {
            e.preventDefault();
            if (imagesURLs.length > 0) {
              try {
                const downloadedImages = await postImageURLs({ urls: imagesURLs });
                setAlertMessage({
                  message: `${downloadedImages?.length || 0} images were downloaded from the ${
                    imagesURLs.length
                  } URLs you uploaded`,
                  type: "success",
                });
              } catch (error) {
                setAlertMessage({ message: `Error in uploading image URLs ${error}`, type: "warning" });
              } finally {
                if (onUploaded) onUploaded();
              }
            }
          }}
        >
          <i className="fas fa-upload"></i>
          Upload{loading && "ing"} {imagesURLs.length} URL{imagesURLs.length > 1 && "s"}
        </button>
      </div>
    </>
  );
};
export default ImageURLUpload;
