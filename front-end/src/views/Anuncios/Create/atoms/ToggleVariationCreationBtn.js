import React                     from "react";
import PropTypes                 from "prop-types";
import { FaTags, FaTimesCircle } from "react-icons/fa";
import { CButton }               from "@coreui/react";

const ToggleVariationCreationBtn = ({ callback, createVariation, btnType }) => {
  return btnType === "confirm" && !createVariation ? (
    <CButton color="primary" onClick={() => callback()}>
      <span>Nova variação&nbsp;<FaTags /></span>
    </CButton>
  ) : btnType === "cancel" && createVariation ? (
    <CButton color="danger" className="float-right" onClick={() => callback()}>
      <span>Limpar&nbsp;<FaTimesCircle /></span>
    </CButton>
  ) : <></>;
};

ToggleVariationCreationBtn.propTypes = {
  isBtnHidden: PropTypes.oneOf("visible", "invisible"),
  callback: PropTypes.func.isRequired,
  btnType: PropTypes.oneOf(["confirm", "cancel"]),
};

export default ToggleVariationCreationBtn;
