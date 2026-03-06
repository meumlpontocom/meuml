import React        from "react";
import { Provider } from "react-redux";

import ListShops    from './templates/ListShops';

import store        from "../../../redux/store";

function ListMercadoShops({history}) {
  return (
    <Provider store={store}>
      <ListShops history={history}/>
    </Provider>
  )
};

export default ListMercadoShops;
