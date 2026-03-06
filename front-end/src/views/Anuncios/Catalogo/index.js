import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import Main from "./Main";

const Catalog = ({ history }) => (
  <Provider store={store}>
    <Main history={history} />
  </Provider>
);

export default Catalog;
