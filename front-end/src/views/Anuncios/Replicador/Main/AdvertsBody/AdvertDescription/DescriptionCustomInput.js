import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Input from "reactstrap/lib/Input";
import Col from "reactstrap/lib/Col";

export default function DescriptionCustomInput({ id }) {
  const dispatch = useDispatch();
  const advertBeingEdited = useSelector(state => state.advertsReplication?.advertBeingEdited);
  const selectedAdverts = useSelector(state => state.advertsReplication?.selectedAdverts);

  const selected = selectedAdverts.filter(advert => advert.id === id);

  function saveNewDescription(newDescription) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: {
        value: { plain_text: newDescription },
        parameter: "description",
      },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-short-text mr-1" />
            Descrição
          </InputGroupText>
        </InputGroupAddon>
        <Input
          name="edit-description"
          id="edit-description"
          type="textarea"
          min={1}
          value={
            !advertBeingEdited?.description?.plain_text
              ? selected.length
                ? selected[0].description?.plain_text
                : advertBeingEdited?.description?.plain_text
              : advertBeingEdited?.description?.plain_text
          }
          placeholder="Deixe em branco para manter a original"
          onChange={({ target: { value } }) => saveNewDescription(value)}
        />
      </InputGroup>
    </Col>
  );
}
