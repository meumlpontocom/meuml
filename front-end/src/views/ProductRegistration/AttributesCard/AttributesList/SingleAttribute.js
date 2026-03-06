import React, { useContext } from "react";
import {
  CButton,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
} from "@coreui/react";
import { ProductRegistrationContext } from "../../ProductRegistrationContext";

const SingleAttribute = ({ id, name, value }) => {
  const { productAttributesList, setProductAttributesList } = useContext(
    ProductRegistrationContext
  );

  function handleDelete() {
    setProductAttributesList(
      productAttributesList.filter((attribute) => attribute.id !== id)
    );
  }

  return (
    <div className="mt-2">
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>Atributo</CInputGroupText>
        </CInputGroupPrepend>
        <CInput value={name} readOnly disabled />

        <CInputGroupPrepend className="rounded-left">
          <CInputGroupText>Valor</CInputGroupText>
        </CInputGroupPrepend>
        <CInput className="rounded-right" value={value} readOnly disabled />
        <CButton
          color="danger"
          className="d-flex align-items-center ml-2"
          onClick={handleDelete}
        >
          <i className="cil-trash" />
        </CButton>
      </CInputGroup>
    </div>
  );
};

export default SingleAttribute;
