import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { ImageType } from "../types";
import { findIndex } from "lodash";
import { Menu } from "./menu";

export const Header: React.FC = () => {
  const { currentCollection, currentImageID } = useContext(AppContext);

  const currentIndex: number = findIndex(
    currentCollection?.images,
    (i: ImageType) => i.id.toString() === currentImageID,
  );
  const previousImageID: number | null =
    currentCollection && currentIndex > 0 ? currentCollection.images[currentIndex - 1].id : null;

  const nextImageID: number | null =
    currentCollection && currentIndex < currentCollection.images.length - 1
      ? currentCollection.images[currentIndex + 1].id
      : null;

  return (
    <header className="sticky-top">
      <nav className="navbar navbar-dark bg-primary navbar-expand-lg navbar-fixed">
        <Link className="navbar-brand" to={"/"} title="Tremulator's home">
          Tr.
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <Menu />
        </div>
      </nav>
    </header>
  );
};
//
// {currentCollection && (
//   <div className=".navbar-text">
//     <h4 className="mx-auto">
//       <Link to={`/collections/${currentCollection.id}`} title={`Collection ${currentCollection.name}`}>
//         {currentCollection.name}
//       </Link>{" "}
//       <Link
//         to={`/collections/${currentCollection.id}/edit`}
//         title={`Edit collection ${currentCollection.name}`}
//       >
//         <i className="fas fa-edit"></i>
//       </Link>
//     </h4>
//     {currentIndex > -1 && (
//       <div className="text-center">
//         {/* previous image button */}
//         {previousImageID && (
//           <Link to={`/collections/${currentCollection.id}/images/${previousImageID}`}>
//             <i className="fas fa-caret-left mr-2"></i>
//           </Link>
//         )}
//         {/* current image index in collection */}
//         {currentIndex + 1}/{currentCollection.images.length}
//         {/* next image button */}
//         {nextImageID && (
//           <Link to={`/collections/${currentCollection.id}/images/${nextImageID}`}>
//             <i className="fas fa-caret-right ml-2"></i>
//           </Link>
//         )}
//       </div>
//     )}
//   </div>
// )}
