import React from "react";
import CustomGroup from "./CustomGroup";
import Input from "reactstrap/lib/Input";
import NumberFormat from "react-number-format";
import { useSelector, useDispatch } from "react-redux";

const PriceInput = () => {
  const dispatch = useDispatch();
  const { price } = useSelector(
    (state) => state.advertsReplication.bulkEdit
  );
  const setPrice = (value) =>
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "price", value },
    });

  return (
    <CustomGroup icon="cash" label="Preço">
      <NumberFormat
        onValueChange={(values) => setPrice(values.floatValue)}
        placeholder="Digite apenas numeros"
        value={price}
        customInput={Input}
        decimalSeparator=","
        thousandSeparator="."
        fixedDecimalScale
        displayType="input"
        prefix="R$"
        decimalScale={2}
        renderText={(value) => <div>{value}</div>}
        name="edit-price"
        id="edit-price"
      />
    </CustomGroup>
  );
};

export default PriceInput;
