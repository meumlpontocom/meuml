import React                        from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectProduct }            from "../../../../../redux/actions/_mshopsActions";

export default function ProductCheckRow({ id }) {
    const dispatch = useDispatch();
    const {
        products,
        allProductsSelected,
        unselectedProductsException,
    } = useSelector((state) => state.mshops);

    const select = (checked) => {
        dispatch(selectProduct({ id, checked }));
    };

    return (
        <td style={{ verticalAlign: "middle" }}>
            <input
                type="checkbox"
                onChange={({ target: { checked } }) => select(checked)}
                checked={
                    products[id].selected ||
                    (allProductsSelected &&
                    !unselectedProductsException.find((adId) => adId === id))
                }
                id={`select-advert-${products[id]}`}
                name={`select-advert-${products[id]}`}
            />
        </td>
    );
}
