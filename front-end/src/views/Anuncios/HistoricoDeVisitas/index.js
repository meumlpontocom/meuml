import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import ViewsDetails from "../../../components/ViewsDetails";

export default function PositioningDetails() {
  return (
    <Provider store={store}>
      <ViewsDetails />
    </Provider>
  );
}
