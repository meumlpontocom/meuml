import React            from "react";
import Label            from "./Label";
import PropTypes        from "prop-types";
import { CCol, CInput } from "@coreui/react";

const NumberInput = ({ id, name, tip, value, onChange }) => {
  return (
    <CCol className="mt-3">
      <Label id={id} name={name} tip={tip} />
      <CInput
        id={id}
        name={name}
        type="number"
        onChange={onChange}
        value={value}
      />
    </CCol>
  );

};

NumberInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tip: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default NumberInput;
