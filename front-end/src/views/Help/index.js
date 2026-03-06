import React from "react";
import Main from "./Main";
import store from "../../redux/store";
import { Provider } from "react-redux";

const Help = ({ history }) => {
  return (
    <Provider store={store}>
      <Main history={history} />
    </Provider>
  );
};

export default Help;
