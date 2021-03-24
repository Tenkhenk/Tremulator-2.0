import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import { AuthenticationContext } from "@axa-fr/react-oidc-context";
import { Link } from "react-router-dom";

/**
 * Display the application user menu.
 */
export const Menu: React.FC = () => {
  const { oidcUser, logout, login } = useContext(AuthenticationContext);

  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  let menu = useRef(null);

  const closeMenu = useCallback(
    (e: MouseEvent) => {
      if (e.target !== menu.current) setMenuOpened(false);
    },
    [setMenuOpened, menu],
  );

  useEffect(() => {
    document.body.addEventListener("click", closeMenu);
    return function cleanup() {
      document.body.removeEventListener("click", closeMenu);
    };
  }, [closeMenu]);

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
          <button
            className="btn btn-link nav-link dropdown-toggle"
            ref={menu}
            onClick={() => setMenuOpened((prev) => !prev)}
          >
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
          </button>
          <ul className={`dropdown-menu${menuOpened ? " opened" : ""}`}>
            <li>
              <Link className="dropdown-item" title="My collections" to="/collections">
                <i className="far fa-images"></i>
                <span className="ml-2">My collections</span>
              </Link>
            </li>
            <li>
              <button className="dropdown-item" onClick={() => logout()} title="sign out">
                <i className="fas fa-sign-out-alt"></i>
                <span className="ml-2">Sign out</span>
              </button>
            </li>
          </ul>
        </li>
      )}
    </ul>
  );
};
