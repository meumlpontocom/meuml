import React from "react";
import PropTypes from "prop-types";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const Input = ({ prepend, datalist = [], ...rest }) => {
  return (
    <>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>{prepend}</CInputGroupText>
        </CInputGroupPrepend>
        <CInput {...rest} />
      </CInputGroup>
      {datalist.length ? (
        <datalist id={rest.id}>
          {datalist.map(value => (
            <option value={value.id} key={value.id}>
              {value.name}
            </option>
          ))}
        </datalist>
      ) : (
        <></>
      )}
    </>
  );
};

Input.propTypes = {
  datalist: PropTypes.array,
  prepend: PropTypes.element,
  rest: PropTypes.any,
};

export default Input;
