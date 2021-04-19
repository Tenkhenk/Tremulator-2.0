import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "./menu";

export const Header: React.FC = () => {
  return (
    <header className="sticky-top">
      <nav className="navbar navbar-dark bg-primary navbar-expand-lg navbar-fixed">
        <div id="brand">
          <Link className="navbar-brand" to={"/"} title="Tremulator's home">
            <img src="./tremulator_logo.jpg" title="Tremulator" alt="tremulator" />
          </Link>
        </div>
        <div id="app-header"></div>

        <div id="menu">
          <div className="collapse navbar-collapse collapse show" id="navbar">
            <Menu />
          </div>
        </div>
      </nav>
    </header>
  );
};
