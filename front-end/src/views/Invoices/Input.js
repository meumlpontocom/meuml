import React from "react";
import Col from "reactstrap/lib/Col";
import Label from "reactstrap/lib/Label";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import Input from "reactstrap/lib/Input";
import PropTypes from "prop-types";

function CustomInput({ label, icon, id, type, onChange, value }) {
  return type !== "hidden" ? (
    <Col xs="12" sm="12" md="4" lg="3" xl="3" className="mt-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className={`cil-${icon || "pencil"}`} />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={({ target: { id, value } }) =>
            onChange({ label: id, value })
          }
        />
      </InputGroup>
    </Col>
  ) : (
    <></>
  );
}

CustomInput.propTypes = {
  label: PropTypes.string,
};

export default CustomInput;
