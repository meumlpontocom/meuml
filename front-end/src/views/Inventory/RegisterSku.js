import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CButton,
  CBadge,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CInput,
  CSpinner,
} from "@coreui/react";
import { updateProductSKU } from "./inventoryRequests";
import styled from "styled-components";

const StyledSkuInputGroup = styled(CInputGroup)`
  display: flex;
  flex-wrap: nowrap;

  > * {
    height: 28px;
  }

  small,
  button,
  label {
    font-size: 10px;
    font-weight: bold;
    margin: 0;
  }

  button {
    min-width: 40px;
    padding: 3px 8px;
    border-radius: 0 4px 4px 0;
  }

  #register-sku-input {
    margin: 0;
  }

  .form-control {
    margin: 0;
    padding: 6px;
  }

  .input-group-text {
    padding: 3px 6px;
  }
`;

export const RegisterSKU = ({ item }) => {
  const [isEditingSKU, setIsEditingSKU] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [sku, setSku] = useState("");
  const [updatedSku, setUpdatedSku] = useState("");

  async function handleRegisterSKU() {
    setIsPending(true);
    await updateProductSKU(item.id, sku).then((res) => {
      if (res && res.data.statusCode === 200) {
        setUpdatedSku(sku);
      }
    });
    setIsEditingSKU(false);
    setIsPending(false);
  }

  if (isEditingSKU) {
    return (
      <StyledSkuInputGroup className="register-sku-input">
        <CInputGroupPrepend>
          <CInputGroupText className={"bg-gradient-secondary text-dark"}>
            <label htmlFor="register-sku-input">
              <small>SKU</small>
            </label>
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          disabled={isPending}
          type="text"
          id="register-sku-input"
          name="register-sku-input"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <CButton
          disabled={isPending}
          color="primary"
          onClick={() => handleRegisterSKU()}
        >
          {isPending ? <CSpinner size="sm" /> : "OK"}
        </CButton>
      </StyledSkuInputGroup>
    );
  }

  if (updatedSku) return updatedSku;

  return (
    <Link to="#">
      <CBadge color="danger" onClick={() => setIsEditingSKU(true)}>
        cadastrar sku
      </CBadge>
    </Link>
  );
};
