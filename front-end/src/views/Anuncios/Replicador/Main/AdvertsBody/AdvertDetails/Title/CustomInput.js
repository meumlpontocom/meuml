import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Input from "reactstrap/lib/Input";
import Col from "reactstrap/lib/Col";

export default function TitleCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewTitle(newTitle) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: { value: newTitle, parameter: "title" },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-text mr-1" />
            Título
          </InputGroupText>
        </InputGroupAddon>
        <Input
          name="edit-title"
          id="edit-title"
          type="text"
          value={advertBeingEdited?.title}
          onChange={({ target: { value } }) => saveNewTitle(value)}
        />
      </InputGroup>
    </Col>
  );
}
