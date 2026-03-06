import React                                   from "react";
import PropTypes                               from "prop-types";
import { CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const InputGroupPrepend = ({ children }) => (
  <CInputGroupPrepend>
    <CInputGroupText>
      {children}
    </CInputGroupText>
  </CInputGroupPrepend>
);

InputGroupPrepend.propTypes = {
  children: PropTypes.any.isRequired
};

export default InputGroupPrepend;
