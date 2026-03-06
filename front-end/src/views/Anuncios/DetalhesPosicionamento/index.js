import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import AdvertDetails from "../../../components/AdvertDetails";

export default function PositioningDetails({ history }) {
  return (
    <Provider store={store}>
      <AdvertDetails history={history} />
    </Provider>
  );
}
