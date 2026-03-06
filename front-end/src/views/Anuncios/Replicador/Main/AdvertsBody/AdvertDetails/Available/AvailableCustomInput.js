import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Input from "reactstrap/lib/Input";
import Col from "reactstrap/lib/Col";

export default function AvailableCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewAvailableQuantity(newAvailableQuantity) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: {
        value: newAvailableQuantity,
        parameter: "available_quantity",
      },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-layers mr-1" />
            Itens Disponíveis
          </InputGroupText>
        </InputGroupAddon>
        <Input
          name="edit-vailable-quantity"
          id="edit-vailable-quantity"
          type="number"
          min={1}
          value={advertBeingEdited?.available_quantity}
          placeholder={
            advertBeingEdited?.available_quantity >= 2
              ? `${advertBeingEdited?.available_quantity} disponíveis`
              : `${advertBeingEdited?.available_quantity} disponível`
          }
          onChange={({ target: { value } }) => saveNewAvailableQuantity(value)}
        />
      </InputGroup>
    </Col>
  );
}
