import React, { useRef, useContext }                                                from "react";
import { v4 as uuidv4 }                                                             from "uuid";
import { ProductRegistrationContext }                                               from "../ProductRegistrationContext";
import { CButton, CForm, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const AttributeInput = () => {
  const {
    productAttribute,
    setProductAttribute,
    productAttributesList,
    setProductAttributesList,
    isPending,
  } = useContext(ProductRegistrationContext);

  const inputRef = useRef(null);

  function handleChange(e) {
    let value = e.target.value;
    if (e.type === "blur") value = value.trim();
    setProductAttribute({ ...productAttribute, [e.target.name]: value });
  }

  function handleAddAttribute() {
    if (Object.values(productAttribute)?.some((value) => value?.trim() === "")) return;
    const productAttibuteToAdd = { ...productAttribute, id: uuidv4() };
    setProductAttributesList([...(productAttributesList || []), productAttibuteToAdd]);
    setProductAttribute({ field: "", value: "" });
    inputRef.current.focus();
  }

  return (
    <CForm onSubmit={(e) => e.preventDefault()}>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>Atributo</CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          innerRef={inputRef}
          disabled={isPending}
          name="field"
          placeholder="Nome do atributo"
          value={productAttribute.field}
          onChange={handleChange}
          onBlur={handleChange}
        />

        <CInputGroupPrepend className="rounded-left">
          <CInputGroupText>Valor</CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          disabled={isPending}
          className="rounded-right"
          name="value"
          placeholder="Valor do atributo"
          value={productAttribute.value}
          onChange={handleChange}
          onBlur={handleChange}
        />
        <CButton
          type="submit"
          color="primary"
          className="d-flex align-items-center ml-2"
          onClick={handleAddAttribute}
        >
          <i className="cil-plus"/>
        </CButton>
      </CInputGroup>
    </CForm>
  );
};

export default AttributeInput;
