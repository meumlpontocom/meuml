import React from "react";
import { Provider } from "react-redux";
import Main from "./Main";
import store from '../../redux/store';

export default function ConfigurarAreaDeCoberturaFlex({ history }) {
  return (
    <Provider store={store}>
      <Main history={history}/>
    </Provider>
  );
}
