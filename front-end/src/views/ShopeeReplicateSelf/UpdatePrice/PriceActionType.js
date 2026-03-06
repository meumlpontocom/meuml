import React from "react";
import PropTypes from "prop-types";
import InputContainer from "./InputContainer";
import { CSelect } from "@coreui/react";

function PriceAction({ handleInputChange, id, name }) {
  return (
    <InputContainer label="Porcentagem / Valor">
      <CSelect id={id} name={name} onChange={handleInputChange}>
        <option value="">Selecionar . . .</option>
        <option value="percentage">Porcentagem</option>
        <option value="value">Valor</option>
      </CSelect>
    </InputContainer>
  );
}

PriceAction.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
};

export default PriceAction;
