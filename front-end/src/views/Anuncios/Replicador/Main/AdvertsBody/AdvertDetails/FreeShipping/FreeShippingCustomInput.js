import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Col from "reactstrap/lib/Col";

export default function FreeShippingCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewAvailableQuantity(newFreeShippingStatus) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: {
        value: { free_shipping: newFreeShippingStatus },
        parameter: "shipping",
      },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i
              className="cil-truck mr-1"
              title={advertBeingEdited?.shipping?.free_shipping ? "Frete Grátis" : "Sem Frete Grátis"}
            />
            Frete Grátis
          </InputGroupText>
        </InputGroupAddon>
        <select
          className="custom-select"
          name="edit-free-shipping"
          id="edit-free-shipping"
          type="text"
          title={advertBeingEdited?.shipping?.free_shipping ? "Frete Grátis" : "Sem Frete Grátis"}
          defaultChecked={true}
          defaultValue={advertBeingEdited?.shipping?.free_shipping}
          onChange={({ target: { value } }) => saveNewAvailableQuantity(value)}
        >
          <option value={true}>Sim</option>
          <option value={false}>Não</option>
        </select>
      </InputGroup>
    </Col>
  );
}
