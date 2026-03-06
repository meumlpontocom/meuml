import React                  from "react";
import Input                  from "./Input";
import PropTypes              from "prop-types";
import { CCol, CLabel, CRow } from "@coreui/react";

const NewRowForm = ({ form, updateFormValue, attributes }) => {
  return (
    <CRow>
      {attributes.map(({ id, name, values }) => {
        return (
          <CCol
            xs="12"
            key={id}
            className="text-left mb-3"
            style={{ paddingLeft: 45, paddingRight: 45 }}
          >
            <CLabel htmlFor={id}>{name}</CLabel>
            <Input
              prepend="<>"
              id={id}
              type="text"
              value={form[id]}
              onChange={updateFormValue}
              placeholder={`Ex.: ${values[0].name}`}
            />
          </CCol>
        );
      })}
    </CRow>
  );
};

NewRowForm.propTypes = {
  value: PropTypes.object.isRequired,
  attributes: PropTypes.array.isRequired,
  updateFormValue: PropTypes.func.isRequired,
};

export default NewRowForm;
