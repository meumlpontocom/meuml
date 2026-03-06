import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Input from "reactstrap/lib/Input";
import Col from "reactstrap/lib/Col";
import NumberFormat from "react-number-format";

export default function PriceCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewPrice(newPrice) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: { value: newPrice, parameter: "price" },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-cash mr-1" />
            Preço
          </InputGroupText>
        </InputGroupAddon>
        <NumberFormat
          onValueChange={values => saveNewPrice(values.floatValue)}
          placeholder="Digite apenas numeros"
          value={advertBeingEdited?.price}
          customInput={Input}
          decimalSeparator=","
          thousandSeparator="."
          fixedDecimalScale
          displayType="input"
          prefix="R$"
          decimalScale={2}
          renderText={value => <div>{value}</div>}
          name="edit-price"
          id="edit-price"
        />
      </InputGroup>
    </Col>
  );
}
