import React     from "react";
import PropTypes from "prop-types";
import { CCol }  from "@coreui/react";
import Label     from "../RequiredAttributesForm/Label";

const Container = ({ children, label, col }) => {
  return (
    <CCol {...col}>
      <Label id={label} name={label} />
      {children}
    </CCol>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  col: PropTypes.object,
};

export default Container;
