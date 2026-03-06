import React, { useContext } from "react";
import { FaAt }              from "react-icons/fa";
import updatePasswordContext from "../updatePasswordContext";
import { 
  CInput, 
  CInputGroup, 
  CInputGroupPrepend, 
  CInputGroupText 
}                            from "@coreui/react";

const EmailInput = () => {
  const { email } = useContext(updatePasswordContext);
  return (
    <CInputGroup>
      <CInputGroupPrepend>
        <CInputGroupText>
          <FaAt />
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        disabled
        size="lg"
        id="email"
        name="email"
        type="email"
        value={email}
        placeholder="Digite aqui seu email"
      />
    </CInputGroup>
  );
};

export default EmailInput;
