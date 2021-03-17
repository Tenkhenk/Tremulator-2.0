import React, { FC } from "react";
import { ImageType } from "../types";

// function to compute the tumbnail url from the iiif url
const thumbnailURL = (iiifURL: string) => iiifURL.split("/").slice(0, -1).join("/") + "/full/200,/0/default.jpg";

interface Props {
  image: ImageType;
}
export const ImageThumbnail: FC<Props> = (props: Props) => {
  const { image } = props;

  return (
    <div className="card m-3" style={{ maxWidth: 200 }}>
      <img className="card-img-top" src={thumbnailURL(image.url)} alt={image.name} />
      <div className="card-body">
        <p className="card-title">{image.name}</p>
      </div>
    </div>
  );
};
