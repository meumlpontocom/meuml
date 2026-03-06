import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Col from "reactstrap/lib/Col";

export default function ConditionCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewCondition(newCondition) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: { value: newCondition, parameter: "condition" },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-star mr-1" />
            Condição do produto
          </InputGroupText>
        </InputGroupAddon>
        <select
          className="custom-select"
          name="edit-condition"
          id="edit-condition"
          type="text"
          defaultChecked={true}
          defaultValue={advertBeingEdited?.condition}
          onChange={({ target: { value } }) => saveNewCondition(value)}
        >
          <option value="new">Novo</option>
          <option value="used">Usado</option>
        </select>
      </InputGroup>
    </Col>
  );
}
