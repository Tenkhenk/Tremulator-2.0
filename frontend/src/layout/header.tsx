import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/app-context";
import { ImageType } from "../types";
import { findIndex } from "lodash";
import { Menu } from "./menu";

export const Header: React.FC = () => {
  return (
    <header className="sticky-top">
      <nav className="navbar navbar-dark bg-primary navbar-expand-lg navbar-fixed">
        <div id="brand">
          <Link className="navbar-brand" to={"/"} title="Tremulator's home">
            Tr.
          </Link>
        </div>

        <div id="app-header"></div>
        <div className="collapse navbar-collapse" id="navbar">
          <Menu />
        </div>
      </nav>
    </header>
  );
};
