import React             from "react";
import PropTypes         from "prop-types";
import { CSpinner }      from "@coreui/react";
import { FaCheckCircle } from "react-icons/fa";

const BtnIcon = ({ isLoading }) => 
  isLoading 
    ? <CSpinner size="sm" className="mb-1" /> 
    : <FaCheckCircle />;

BtnIcon.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default BtnIcon;
