import React, { FC } from "react";
import { Link } from "react-router-dom";
import { CollectionModelFull, ImageModelFull } from "../types";

interface Props {
  collection: CollectionModelFull;
  image: ImageModelFull;
}
export const ImagePageHeader: FC<Props> = (props: Props) => {
  const { collection, image } = props;

  const currentIndex = collection.images.findIndex((item) => item.id === image.id);
  const prev = currentIndex > 0 ? collection.images[currentIndex - 1] : null;
  const next = currentIndex < collection.images.length - 1 ? collection.images[currentIndex + 1] : null;

  return (
    <>
      {prev && (
        <Link title={prev.name} to={`/collections/${collection.id}/images/${prev.id}`}>
          <i className="fas fa-caret-left"></i>
        </Link>
      )}
      <h1>
        <Link title={collection.name} to={`/collections/${collection.id}`}>
          {collection.name} - {currentIndex + 1} / {collection.images.length}
        </Link>
      </h1>
      {next && (
        <Link title={next.name} to={`/collections/${collection.id}/images/${next.id}`}>
          <i className="fas fa-caret-right"></i>
        </Link>
      )}
    </>
  );
};
