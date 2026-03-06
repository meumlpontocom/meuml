import React from "react";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import AdvertStatusBulkUpdate from "../../../components/AdvertStatusBulkUpdate";

export default function AtualizarStatusEmMassa({ history }) {
  return (
    <Provider store={store}>
      <AdvertStatusBulkUpdate history={history} />
    </Provider>
  );
}
