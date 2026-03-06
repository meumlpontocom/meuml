import React                 from "react";
import PropTypes             from "prop-types";
import { CCardHeader, CCol } from "@coreui/react";

const CardHeader = ({ title, subtitle }) => {
  return (
    <CCardHeader>
      <CCol xs="12">
        <h3 className="text-primary">{title}</h3>
        <h4 className="muted">{subtitle}</h4>
      </CCol>
    </CCardHeader>
  );
};

CardHeader.propTypes = {
  title: PropTypes.any.isRequired,
  subtitle: PropTypes.any,
};

export default CardHeader;
