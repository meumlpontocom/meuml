import React            from "react";
import Label            from "./Label";
import PropTypes        from "prop-types";
import { CCol, CInput } from "@coreui/react";

const StringInput = ({ id, name, tip, hints, value, onChange }) => {
  return (
    <CCol className="mt-3">
      <Label id={id} name={name} tip={tip} />
      <CInput
        list={`${id}-datalist`}
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
      />
      {!hints?.length ? <></> : (
        <datalist id={`${id}-datalist`}>
          {hints.map(({ id, name }) => (
            <option key={id} id={id} name={name} value={name}>
              {name}
            </option>
          ))}
        </datalist>
      )}
    </CCol>
  );
};

StringInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tip: PropTypes.string,
  value: PropTypes.any,
  hints: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

export default StringInput;
