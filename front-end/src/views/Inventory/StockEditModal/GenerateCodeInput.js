import React from "react";
import {
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
} from "@coreui/react";
import styled from "styled-components";

const GenerateCodeInputStyles = styled(CInputGroup)`
  flex-direction: column;
  .input-group {
    justify-content: flex-end;
  }
`;

const GenerateCodeInput = ({
  label,
  checkGenerateCode,
  setCheckGenerateCode,
  transactionCode,
  setTransactionCode,
}) => {
  return (
    <GenerateCodeInputStyles>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText className={"bg-gradient-primary text-white"}>
            <label htmlFor="purchase-code">{label}</label>
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          disabled={checkGenerateCode}
          type="text"
          id="purchase-code"
          name="purchase-code"
          value={checkGenerateCode ? "Gerado automaticamente" : transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
        />
      </CInputGroup>
      <CInputGroup>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="auto-generate-code"
            id="auto-generate-code"
            checked={checkGenerateCode}
            onChange={() => setCheckGenerateCode(!checkGenerateCode)}
          />
          <label
            htmlFor="auto-generate-code"
            className="d-flex align-items-center justify-content-center"
          >
            Gerar automaticamente
          </label>
        </div>
      </CInputGroup>
    </GenerateCodeInputStyles>
  );
};

export default GenerateCodeInput;
