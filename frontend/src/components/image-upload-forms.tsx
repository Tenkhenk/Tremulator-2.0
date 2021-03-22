import React, { useState } from "react";
import { CollectionModelFull } from "../types";
import ImageUpload from "./image-upload";
import ImageURLUpload from "./image-url-upload";

interface Props {
  onUploaded: () => void;
  collection: CollectionModelFull;
}

enum UploadMethod {
  LocalImage = "LocalImage",
  DistantImage = "DistantImage",
  IIIFImage = "IIIFImage",
}

const ImageUploadForms: React.FC<Props> = (props: Props) => {
  const { collection, onUploaded } = props;
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(UploadMethod.LocalImage);

  return (
    <div className="container">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            onClick={() => setUploadMethod(UploadMethod.LocalImage)}
            className={`btn btn-link nav-link ${uploadMethod === UploadMethod.LocalImage ? "active" : ""}`}
          >
            Local images
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setUploadMethod(UploadMethod.DistantImage)}
            className={`btn btn-link nav-link ${uploadMethod === UploadMethod.DistantImage ? "active" : ""}`}
          >
            Distant Images
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setUploadMethod(UploadMethod.IIIFImage)}
            className={`btn btn-link nav-link ${uploadMethod === UploadMethod.IIIFImage ? "active" : ""}`}
          >
            IIIF Images
          </button>
        </li>
      </ul>
      {/* LOCAL IMAGE UPLOAD */}
      {uploadMethod === UploadMethod.LocalImage && <ImageUpload onUploaded={onUploaded} collection={collection} />}
      {/* DISTANT IMAGE UPLOAD */}
      {uploadMethod === UploadMethod.DistantImage && <ImageURLUpload onUploaded={onUploaded} collection={collection} />}
    </div>
  );
};

export default ImageUploadForms;
