import React, {useContext} from "react";
import { Link } from "react-router-dom";
import { AuthenticationContext } from '@axa-fr/react-oidc-context';
import { AppContext } from "../context/app-context";

const Header = () => {
  const {oidcUser, logout, login} = useContext(AuthenticationContext);
  const {currentCollection} = useContext(AppContext);
  return (
    <header>
      <nav className="navbar container-fluid">
        <Link className="navbar-brand" to={"/"}>
          Tr.
        </Link>
        {currentCollection && <h4><Link to={`/collections/${currentCollection.id}`}>{currentCollection.name}</Link> <Link to={`/collections/${currentCollection.id}/edit`} title="edit"><i className="fas fa-edit"></i></Link></h4>}
        {oidcUser &&
          <div>
            {oidcUser.profile.picture ? <img className="profile" src={oidcUser.profile.picture}></img>: <i className="fas fa-user"></i>}
            <span className="ml-3 mr-3">
              {oidcUser.profile.name}
            </span>
            <button onClick={() => logout()} title="sign out">
              <i className="fas fa-sign-out-alt" title="signout"></i>
            </button>
          </div>
        }
        {!oidcUser && <button onClick={() => login()}><i className="fas fa-sign-in-alt"></i><span className="ml-3">Sign in</span></button>}
      </nav>
    </header>
  );
};

export default Header;
