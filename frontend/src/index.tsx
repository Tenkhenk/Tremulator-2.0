import "./scss/index.scss";

// React
import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";

// Routing system
import { BrowserRouter as Router } from "react-router-dom";
import { RouterWrapper } from "./router/router";
import { routes } from "./router/routes";
// Layout
import Footer from "./layout/footer";
import Header from "./layout/header";

ReactDOM.render(
  <div id="app-wrapper">
    <Router>
      <Header />
      <main className="container">
        <RouterWrapper routes={routes} />
      </main>
      <Footer />
    </Router>
  </div>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
