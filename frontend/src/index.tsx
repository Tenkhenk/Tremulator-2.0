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
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";
import { Alert } from "./components/alert";
// contexts
import { config } from "./config/index";
import { AppContextProvider } from "./context/app-context-provider";
import { AuthenticationProvider, oidcLog } from "@axa-fr/react-oidc-context";
// auth
import { Authenticating, Authenticated, NotAuthenticated, SessionLost } from "./pages/auth/auth-messages";

class LocalStorage {
  constructor() {
    return window.localStorage;
  }
}

ReactDOM.render(
  <AuthenticationProvider
    configuration={config.auth}
    UserStore={LocalStorage}
    loggerLevel={oidcLog.ERROR}
    authenticating={Authenticating}
    callbackComponentOverride={Authenticated}
    notAuthorized={NotAuthenticated}
    sessionLostComponent={SessionLost}
  >
    <AppContextProvider>
      <Router>
        <Header />
        <Alert />
        <main className="container-fluid" role="main">
          <RouterWrapper routes={routes} />
        </main>
        <Footer />
      </Router>
    </AppContextProvider>
  </AuthenticationProvider>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
