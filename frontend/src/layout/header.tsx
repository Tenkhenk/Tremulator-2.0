import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { AppContext } from "../context/app-context";
import { ImageType } from "../types";
import { findIndex } from "lodash";

const Header = () => {
  const { oidcUser, logout, login } = useContext(AuthenticationContext);
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
    <header>
      <nav className="navbar container-fluid">
        <Link className="navbar-brand" to={"/"}>
          Tr.
        </Link>
        {currentCollection && (
          <div className=".navbar-text">
            <h4 className="mx-auto">
              <Link to={`/collections/${currentCollection.id}`}>{currentCollection.name}</Link>{" "}
              <Link to={`/collections/${currentCollection.id}/edit`} title="edit">
                <i className="fas fa-edit"></i>
              </Link>
            </h4>
            {currentIndex > -1 && (
              <div className="text-center">
                {/* previous image button */}
                {previousImageID && (
                  <Link to={`/collections/${currentCollection.id}/images/${previousImageID}`}>
                    <i className="fas fa-caret-left mr-2"></i>
                  </Link>
                )}
                {/* current image index in collection */}
                {currentIndex + 1}/{currentCollection.images.length}
                {/* next image button */}
                {nextImageID && (
                  <Link to={`/collections/${currentCollection.id}/images/${nextImageID}`}>
                    <i className="fas fa-caret-right ml-2"></i>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        {oidcUser && (
          <div>
            {oidcUser.profile.picture ? (
              <img className="profile" src={oidcUser.profile.picture}></img>
            ) : (
              <i className="fas fa-user"></i>
            )}
            <span className="ml-3 mr-3">{oidcUser.profile.name}</span>
            <button onClick={() => logout()} title="sign out">
              <i className="fas fa-sign-out-alt" title="signout"></i>
            </button>
          </div>
        )}
        {!oidcUser && (
          <button onClick={() => login()}>
            <i className="fas fa-sign-in-alt"></i>
            <span className="ml-3">Sign in</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
