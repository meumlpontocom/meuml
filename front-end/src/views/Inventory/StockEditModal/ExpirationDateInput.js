import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";

const ExpirationDateInput = ({ expirationDate, setExpirationDate }) => {
  return (
    <CInputGroup className="exp-date">
      <CInputGroupPrepend>
        <CInputGroupText className={"bg-gradient-primary text-white"}>
          <label htmlFor="expiration-date">Data de validade</label>
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        type="date"
        id="expiration-date"
        name="expiration-date"
        value={expirationDate || ""}
        onChange={(e) => setExpirationDate(e.target.value)}
      />
    </CInputGroup>
  );
};

export default ExpirationDateInput;
