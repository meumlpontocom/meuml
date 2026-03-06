import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import Main from "./Main";

export default function EnvioFlexEmMassa({ history }) {
  return (
    <Provider store={store}>
      <Main history={history} />
    </Provider>
  );
}
