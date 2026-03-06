import React, { useContext } from "react";
import PropTypes from "prop-types";
import { CInputGroup, CLabel, CSelect } from "@coreui/react";
import InputGroupPrepend from "./InputGroupPrepend";
import { FaCaretRight } from "react-icons/fa";
import { catalogChartsContext } from "../catalogChartsContext";

const RequiredAttributesSelect = ({ id, name, handleInputChange, values, index }) => {
  const { isLoadingCatalogCharts } = useContext(catalogChartsContext);
  return (
    <>
      <CLabel htmlFor={id} className={index % 2 > 0 && "mt-3"}>
        {name}
      </CLabel>
      <CInputGroup>
        <InputGroupPrepend>
          <FaCaretRight />
        </InputGroupPrepend>
        <CSelect id={id} onChange={handleInputChange} disabled={isLoadingCatalogCharts}>
          <option value="">Selecione...</option>
          {values.map(({ id, name }) => (
            <option id={id} name={name} value={name} key={id}>
              {name}
            </option>
          ))}
        </CSelect>
      </CInputGroup>
    </>
  );
};

RequiredAttributesSelect.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  values: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
};

export default RequiredAttributesSelect;
