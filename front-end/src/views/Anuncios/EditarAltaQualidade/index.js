import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import EditToReachHighQuality from "./Main";

export default function EditarAltaQualidade({ history }) {
  return (
    <Provider store={store}>
      <EditToReachHighQuality history={history} />
    </Provider>
  );
}
