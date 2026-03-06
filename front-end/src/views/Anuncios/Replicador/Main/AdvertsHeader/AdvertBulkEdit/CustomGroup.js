import React from "react";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupText from "reactstrap/lib/InputGroupText";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";

const CustomGroup = ({ icon, label, children }) => {
  return (
    <InputGroup className="mt-2">
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className={`cil-${icon} mr-1`} />
          {label}
        </InputGroupText>
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
};

export default CustomGroup;
