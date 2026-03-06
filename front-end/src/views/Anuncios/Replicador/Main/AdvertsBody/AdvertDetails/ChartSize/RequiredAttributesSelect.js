import React from "react";
import PropTypes from "prop-types";
import { CInputGroup, CSelect } from "@coreui/react";
import InputGroupPrepend from "src/views/Anuncios/CatalogCharts/atoms/InputGroupPrepend";

const RequiredAttributesSelect = ({ id, name, handleInputChange, values, index }) => {
  return (
    <>
      <CInputGroup className="mb-2">
        <InputGroupPrepend>{name}</InputGroupPrepend>
        <CSelect id={id} onChange={handleInputChange} disabled>
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
