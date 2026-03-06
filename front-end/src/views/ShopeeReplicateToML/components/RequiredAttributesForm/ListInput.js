import React             from "react";
import Label             from "./Label";
import PropTypes         from "prop-types";
import { CCol, CSelect } from "@coreui/react";

const ListInput = ({ id, name, tip, options, value, onChange }) => {
  return (
    <CCol xs={12} className="mt-3">
      <Label id={id} name={name} tip={tip} />
      <CSelect id={id} onChange={onChange} value={value}>
        <option id="{}" value={"{}"}>Selecione ...</option>
        {options.map((op) => (
          <option
            id={op.id}
            name={op.name}
            value={op.value}
            key={op.id}
          >
            {op.name}
          </option>
        ))}
      </CSelect>
    </CCol>
  );
};

ListInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tip: PropTypes.string,
  value: PropTypes.any,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ListInput;
