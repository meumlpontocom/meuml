import React from "react";
import { useDispatch, useSelector } from "react-redux";
// Reactstrap
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Col from "reactstrap/lib/Col";

export default function ListingTypeCustomInput() {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);

  function saveNewListingType(newListingType) {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: { value: newListingType, parameter: "listing_type_id" },
    });
  }

  return (
    <Col xs={12} className="mb-2">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i
              className="cil-audio-description mr-1"
              title={advertBeingEdited?.listing_type_id === "gold_special" ? "Clássico" : "Premium"}
            />
            Tipo do anúncio
          </InputGroupText>
        </InputGroupAddon>
        <select
          className="custom-select"
          name="edit-listing-type"
          id="edit-listing-type"
          type="text"
          defaultChecked={true}
          defaultValue={advertBeingEdited?.listing_type_id}
          title={advertBeingEdited?.listing_type_id === "gold_special" ? "Clássico" : "Premium"}
          onChange={({ target: { value } }) => saveNewListingType(value)}
        >
          <option value="gold_pro">Premium</option>
          <option value="gold_special">Clássico</option>
        </select>
      </InputGroup>
    </Col>
  );
}
