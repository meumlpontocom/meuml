import React from "react";
import CustomGroup from "./CustomGroup";
import { useSelector, useDispatch } from "react-redux";

const FreeShippingInput = () => {
  const dispatch = useDispatch();
  const { free_shipping } = useSelector(
    (state) => state.advertsReplication.bulkEdit
  );
  const setFreeShipping = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "free_shipping", value },
    });

  return (
    <CustomGroup icon="truck" label="Frete Grátis">
      <select
        className="custom-select"
        name="edit-free-shipping"
        id="edit-free-shipping"
        type="text"
        value={free_shipping}
        onChange={(event) => setFreeShipping(event.target.value)}
      >
        <option value="keep_original">Manter original</option>
        <option value={true}>Sim</option>
        <option value={false}>Não</option>
      </select>
    </CustomGroup>
  );
};

export default FreeShippingInput;
