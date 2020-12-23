import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <nav className="container navbar">
        <Link className="navbar-brand" to={"/"}>
          <img src="/logo.png" alt="Tremulator logo" height="50px" />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
