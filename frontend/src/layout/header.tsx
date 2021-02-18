import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/user";
const Header = () => {
  const {user} = useUser();
  return (
    <header>
      <nav className="navbar container-fluid">
        <Link className="navbar-brand" to={"/"}>
          Tr.
        </Link>

        {user &&
          <div>
            <i className="fas fa-user"></i><span className="ml-3 mr-3">{user?.firstname} {user?.lastname}</span><Link to={"/auth/logout"} title="sign out"><i className="fas fa-sign-out-alt" title="signout"></i></Link>
          </div>
        }
        {!user && <Link to={"/collections"} ><button><i className="fas fa-sign-in-alt"></i><span className="ml-3">Sign in</span></button></Link>}
      </nav>
    </header>
  );
};

export default Header;
