import React, {useContext} from "react";
import { Link } from "react-router-dom";
import { AuthenticationContext } from '@axa-fr/react-oidc-context';

const Header = () => {
  const {oidcUser, logout, login} = useContext(AuthenticationContext);
  return (
    <header>
      <nav className="navbar container-fluid">
        <Link className="navbar-brand" to={"/"}>
          Tr.
        </Link>

        {oidcUser &&
          <div>
            <i className="fas fa-user"></i><span className="ml-3 mr-3">{oidcUser.profile.firstname} {oidcUser.profile.lastname}</span><button onClick={() => logout()} title="sign out"><i className="fas fa-sign-out-alt" title="signout"></i></button>
          </div>
        }
        {!oidcUser && <button onClick={() => login()}><i className="fas fa-sign-in-alt"></i><span className="ml-3">Sign in</span></button>}
      </nav>
    </header>
  );
};

export default Header;
