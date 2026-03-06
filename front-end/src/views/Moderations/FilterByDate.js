import React from "react";
import { useDispatch } from "react-redux";
import {
  CInput,
  CInputGroup,
  CInputGroupText,
  CLabel,
  CInputGroupPrepend,
} from "@coreui/react";

export default function FilterByDate({ labelText, action, value }) {
  const dispatch = useDispatch();
  const handleChange = ({ value }) => dispatch(action(value));
  return (
    <>
      <CLabel htmlFor="date-input">{labelText}</CLabel>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <i className="cil-calendar" />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          type="date"
          value={value}
          id="date-input"
          onChange={(e) => handleChange(e.target)}
        />
      </CInputGroup>
    </>
  );
}
