import React from "react";
import { CCard, CCardBody, CCardHeader, CAlert } from "@coreui/react";
import AttributeInput from "./AttributeInput";
import AttributesList from "./AttributesList";

const AttributesCard = () => {
  return (
    <CCard>
      <CCardHeader>
        <h5 className="mb-0">Atributos</h5>
      </CCardHeader>
      <CCardBody>
        <CAlert color="info" className="d-flex align-items-center">
          <i className="cil-lightbulb mr-2" />
          <p className="mb-0">
            <em>
              Você pode adicionar quantos atributos precisar, basta preencher os
              campos e pressionar o botão <strong>+</strong>
            </em>
          </p>
        </CAlert>
        <AttributeInput />
        <AttributesList />
      </CCardBody>
    </CCard>
  );
};

export default AttributesCard;
