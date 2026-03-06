import React from "react";
import {
  CCol,
  CInputGroup,
  CInputGroupAppend,
  CInputGroupPrepend,
  CInputGroupText,
  CLabel,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import PropTypes from "prop-types";

export default function InputContainer({
  columns,
  label,
  icon,
  children,
  symbol,
}) {
  return (
    <CCol {...columns} className="mb-2">
      <CLabel>{label}</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <CIcon name={icon} />
          </CInputGroupText>
        </CInputGroupPrepend>
        {children}
        {symbol && (
          <CInputGroupAppend>
            <CInputGroupText>{symbol}</CInputGroupText>
          </CInputGroupAppend>
        )}
      </CInputGroup>
    </CCol>
  );
}

InputContainer.propTypes = {
  columns: PropTypes.object,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  symbol: PropTypes.string,
};
