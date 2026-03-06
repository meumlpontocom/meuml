import React from "react";
import Main from "../../../components/AdMassChanges";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import MainHeaderFooter from "./Main";

export default function MassHeaderFooter({ history }) {
  return (
    <Provider store={store}>
      <Main title="Alteração de cabeçalho e rodapé em massa">
        <MainHeaderFooter history={history}></MainHeaderFooter>
      </Main>
    </Provider>
  );
}
