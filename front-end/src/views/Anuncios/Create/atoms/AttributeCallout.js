import React from "react";
import PropTypes from "prop-types";
import { CCallout, CCol } from "@coreui/react";

const AttributeCallout = ({ id, label, value, color }) => {
  return (
    <CCol xs="12" sm="6" md="4" lg="3">
      <CCallout color={color} id={id}>
        <span className="text-info">{label}:&nbsp;</span>
        {value}
      </CCallout>
    </CCol>
  );
};

AttributeCallout.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["warning", "danger", "success", "info", "primary", "secondary", "dark", "light", "muted"]),
};

export default AttributeCallout;
