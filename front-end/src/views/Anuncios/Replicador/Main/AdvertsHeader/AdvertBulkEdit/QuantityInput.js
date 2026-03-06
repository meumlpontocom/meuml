import React from "react";
import CustomGroup from "./CustomGroup";
import Input from "reactstrap/lib/Input";
import { useDispatch } from "react-redux";

const QuantityInput = () => {
  const dispatch = useDispatch();
  const setQuantity = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "available_quantity", value },
    });

  return (
    <CustomGroup icon="layers" label="Itens Disponíveis">
      <Input
        name="edit-vailable-quantity"
        id="edit-vailable-quantity"
        type="number"
        min={1}
        placeholder="Manter original"
        onChange={(event) => setQuantity(event.target.value)}
      />
    </CustomGroup>
  );
};

export default QuantityInput;
