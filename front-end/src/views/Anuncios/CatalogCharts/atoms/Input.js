import React                   from "react";
import PropTypes               from "prop-types";
import { CInput, CInputGroup } from "@coreui/react";
import InputGroupPrepend       from "./InputGroupPrepend";

const Input = ({ prepend, ...rest }) => {
  return (
    <CInputGroup>
      <InputGroupPrepend>{prepend}</InputGroupPrepend>
      <CInput {...rest} />
    </CInputGroup>
  );
};

Input.propTypes = {
  prepend: PropTypes.element,
  rest: PropTypes.any,
};

export default Input;
