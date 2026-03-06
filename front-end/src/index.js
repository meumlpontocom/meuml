import "react-app-polyfill/ie9"; // For IE 9-11 support
import "react-app-polyfill/ie11"; // For IE 11 support
import "./config/ReactotronConfig";
import "react-picky/dist/picky.css";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import App from "./App";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import store from "./redux/store";
import { icons } from "./assets/icons";
import { ToastContainer } from "react-toastify";
import TagManager from "react-gtm-module";
import * as Sentry from "@sentry/react";

React.icons = icons;

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost"],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

Sentry.setUser({
  username: localStorage.getItem("@MeuML-UserName"),
  email: localStorage.getItem("@MeuML-UserEmail"),
});

TagManager.initialize({ gtmId: process.env.REACT_APP_GTM_KEY });

ReactDOM.render(
  <Provider store={store}>
    <App />
    <ToastContainer />
  </Provider>,
  document.getElementById("root"),
);

serviceWorker.unregister();
