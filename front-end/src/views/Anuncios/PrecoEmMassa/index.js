import React from "react";
import Main from "../../../components/AdMassChanges";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import MainPrice from "./Main";

export default function MassPrice({ history }) {
  return (
    <Provider store={store}>
      <Main title="Alteração de preço em massa">
        <MainPrice history={history}></MainPrice>
      </Main>
    </Provider>
  );
}
