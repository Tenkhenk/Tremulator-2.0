import React, { useContext } from "react";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { Link } from "react-router-dom";

/**
 * Display the application user menu.
 */
export const Menu: React.FC = () => {
  const { oidcUser, logout, login } = useContext(AuthenticationContext);

  return (
    <ul className="navbar-nav navbar-align">
      {!oidcUser && (
        <li className="nav-item">
          <button onClick={() => login()} className="btn btn-outline-light">
            <i className="fas fa-sign-in-alt"></i>
            <span className="ml-3">Sign in</span>
          </button>
        </li>
      )}
      {oidcUser && (
        <li className="nav-item dropdown">
          <Link className="btn btn-link nav-link dropdown-toggle" to="/collections" title="My collections">
            {oidcUser.profile.picture ? (
              <img
                className="avatar rounded-circle"
                src={oidcUser.profile.picture}
                alt={`${oidcUser.profile.name}'s avatar`}
              ></img>
            ) : (
              <i className="fas fa-user"></i>
            )}
            {oidcUser.profile.name}
          </Link>
          <ul className="dropdown-menu">
            <li>
              <Link className="dropdown-item" title="My collections" to="/collections">
                <i className="far fa-images"></i>
                <span className="ml-3">My collections</span>
              </Link>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => logout()} title="sign out">
                <i className="fas fa-sign-out-alt"></i>
                <span className="ml-3">Sign out</span>
              </button>
            </li>
          </ul>
        </li>
      )}
    </ul>
  );
};
