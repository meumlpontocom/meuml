import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import AdvertsEditView from "./Main";

export default function AdvertEdit({ history, location }) {
  return (
    <Provider store={store}>
      <AdvertsEditView history={history} state={location.state} />
    </Provider>
  );
}
