import React, { useContext } from "react";
import PropTypes from "prop-types";
import { CSelect } from "@coreui/react";
import { createMlAdvertContext } from "../createMlAdvertContext";

const Select = ({ options, onChangeCallback, ...rest }) => {
  const { setFormData } = useContext(createMlAdvertContext);

  function handleSelectValueChange({ target: { id, value } }) {
    if (onChangeCallback) onChangeCallback({ id, value });
    else setFormData({ id, value });
  }

  return (
    <CSelect onChange={handleSelectValueChange} {...rest}>
      <option value="">Selecione ...</option>
      {options.map(attribute => {
        return (
          <option key={attribute.id} id={attribute.id} value={JSON.stringify(attribute)}>
            {attribute.name}
          </option>
        );
      })}
    </CSelect>
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
};

export default Select;
