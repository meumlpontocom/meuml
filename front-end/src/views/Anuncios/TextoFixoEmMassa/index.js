import React from "react";
import Main from "../../../components/AdMassChanges";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import MainTextFixed from "./Main";

export default function MassTextFix({ history }) {
  return (
    <Provider store={store}>
      <Main title="Alteração do texto fixo de descrição em massa">
        <MainTextFixed history={history}></MainTextFixed>
      </Main>
    </Provider>
  );
}
