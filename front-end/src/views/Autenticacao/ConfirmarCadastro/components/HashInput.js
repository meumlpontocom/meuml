import React from "react";
import { FaHashtag } from "react-icons/fa";
import { CInput, CInputGroup, CInputGroupAppend, CInputGroupText } from "@coreui/react";

const HashInput = ({ hash, setHash }) => {
  return (
    <CInputGroup>
      <CInput
        size="lg"
        type="text"
        id="hash-input"
        name="hash-input"
        placeholder="Cole ou digite seu código"
        value={hash}
        onChange={({ target: { value } }) => setHash(value)}
      />
      <CInputGroupAppend>
        <CInputGroupText>
          <FaHashtag />
        </CInputGroupText>
      </CInputGroupAppend>
    </CInputGroup>
  );
};

export default HashInput;
