import React, { useContext } from "react";
import { CCard, CCardHeader, CCardBody, CBadge } from "@coreui/react";
import Form from "./Form";
import ConfigurationData from "../ConfigurationData";
import styled from "styled-components";
import { FlexConfigContext } from "../../FlexConfigContext";

export default function Body() {
  const { currentFlexConfig } = useContext(FlexConfigContext);
  return (
    <CardsContainer>
      <CCard>
        <StyledCCardHeader>
          <h4>Configurações atuais</h4>
          {currentFlexConfig?.adoption?.status ? (
            <CBadge color="primary">Flex ativo</CBadge>
          ) : (
            <CBadge color="secondary">Flex inativo</CBadge>
          )}
        </StyledCCardHeader>
        <CCardBody>
          <ConfigurationData />
        </CCardBody>
      </CCard>
      <CCard>
        <CCardHeader>
          <h4>Configurar</h4>
        </CCardHeader>
        <CCardBody>
          <Form />
        </CCardBody>
      </CCard>
    </CardsContainer>
  );
}

const StyledCCardHeader = styled(CCardHeader)`
  display: flex;
  align-items: center;

  .badge {
    margin-left: 16px;
  }
`;

const CardsContainer = styled(CCardBody)`
  display: flex;
  gap: 16px;
  background-color: hsl(246, 73%, 95%);

  h4 {
    margin-bottom: 0;
  }

  .card {
    min-width: 45%;
    margin-bottom: 0;
    flex-grow: 1;
  }

  @media (max-width: 1280px) {
    flex-direction: column;
  }
`;
