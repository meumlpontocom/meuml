import React        from "react";
import { Provider } from "react-redux";
import store        from "../../../redux/store";

import ProductStatusUpdate from "../ListMercadoShops/atoms/ProductStatusUpdate";

export default function ProductAtualizarStatusEmMassa({ history }) {
    return (
        <Provider store={store}>
            <ProductStatusUpdate history={history} />
        </Provider>
    );
}
