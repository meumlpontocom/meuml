import React from "react";
import Main from "../../../components/AdMassChanges";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import MainDescription from "./Main";

export default function MassDescription({ history }) {
  return (
    <Provider store={store}>
      <Main title="Substituir texto descrição em massa">
        <MainDescription history={history}></MainDescription>
      </Main>
    </Provider>
  );
}
