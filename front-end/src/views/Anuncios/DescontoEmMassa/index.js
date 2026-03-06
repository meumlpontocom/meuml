import React from "react";
import Main from "../../../components/AdMassChanges";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import MainDiscount from "./Main";

export default function MassDiscount({ history }) {
  return (
    <Provider store={store}>
      <Main title="Aplicar desconto">
        <MainDiscount history={history}></MainDiscount>
      </Main>
    </Provider>
  );
}
