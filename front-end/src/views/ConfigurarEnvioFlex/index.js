import React from "react";
import { Provider } from "react-redux";
import Main from "./Main";
import store from "../../redux/store";
import { FlexConfigContextProvider } from "./FlexConfigContext";

export default function ConfigurarEnvioFlex({ history }) {
  return (
    <Provider store={store}>
      <FlexConfigContextProvider>
        <Main history={history} />
      </FlexConfigContextProvider>
    </Provider>
  );
}
