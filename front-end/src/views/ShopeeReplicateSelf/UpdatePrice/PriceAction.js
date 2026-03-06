import React from "react";
import PropTypes from "prop-types";
import InputContainer from "./InputContainer";
import { CSelect } from "@coreui/react";

function PriceAction({ handleInputChange, id, name }) {
  return (
    <InputContainer label="Subir / Abaixar preço">
      <CSelect id={id} name={name} onChange={handleInputChange}>
        <option value="">Selecionar . . .</option>
        <option value="increase">Subir preço</option>
        <option value="decrease">Baixar preço</option>
      </CSelect>
    </InputContainer>
  );
}

PriceAction.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
};

export default PriceAction;
