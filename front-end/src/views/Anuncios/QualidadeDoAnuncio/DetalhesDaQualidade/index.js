/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "../../../../redux/store";
import Main from "./Main";

export default function DetalhesDaQualidade({ history, location: { state } }) {
  useEffect(() => {
    if (!state) history.goBack();
    return () => {
      return history;
    };
  }, []);

  if (!state) return <></>;

  return (
    <Provider store={store}>
      <Main history={history} state={state} />
    </Provider>
  );
}
