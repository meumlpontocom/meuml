import React, { useCallback }       from "react";
import { useDispatch, useSelector } from "react-redux";
import Col                          from "reactstrap/lib/Col";
import Input                        from "reactstrap/lib/Input";
import InputGroup                   from "reactstrap/lib/InputGroup";
import InputGroupText               from "reactstrap/lib/InputGroupText";
import InputGroupAddon              from "reactstrap/lib/InputGroupAddon";

export default function GtinCustomInput() {
  const dispatch          = useDispatch();
  const advertBeingEdited = useSelector((state) => state.advertsReplication.advertBeingEdited);
  const saveGtin = useCallback(({ target: { value } }) => {
    dispatch({
      type: "REPLICATION_UPDATE_ADVERT_DATA",
      payload: { value, parameter: "ean" },
    });
  }, [dispatch]);

  return (
    <Col xs={12} className="mb-3">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-text mr-1" />
            EAN/GTIN
          </InputGroupText>
        </InputGroupAddon>
        <Input
          type="text"
          id="edit-gtin"
          name="edit-gtin"
          onChange={saveGtin}
          value={advertBeingEdited?.ean}
          placeholder="Deixe em branco para manter o original"
        />
      </InputGroup>
    </Col>
  );
}
