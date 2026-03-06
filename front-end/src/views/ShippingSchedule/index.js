import React, { useState, useCallback } from "react";
import ScheduleList from "./components/ScheduleList";
import { Provider } from "./shippingScheduleContext";
import PageHeader from "src/components/PageHeader";
import useShippingSchedule from "./hooks/useShippingSchedule";
import RequiredFilters from "./components/RequiredFilters";
import { CContainer, CCol, CCard, CCardHeader, CCardBody } from "@coreui/react";

const ShippingSchedule = () => {
  const [selectedAccount, setSelectedAccount] = useState([]);
  const [selectedScheduleTypes, setSelectedScheduleTypes] = useState([]);
  const [shippingSchedules, getShippingSchedule] = useShippingSchedule();

  const handleSelectAccount = useCallback(account => setSelectedAccount(account), [setSelectedAccount]);
  const handleSelectScheduleType = useCallback(
    selectedTypes => setSelectedScheduleTypes(selectedTypes),
    [setSelectedScheduleTypes],
  );
  return (
    <CContainer>
      <Provider
        value={{
          selectedAccount,
          handleSelectAccount,
          selectedScheduleTypes,
          handleSelectScheduleType,
          shippingSchedules,
          getShippingSchedule,
        }}
      >
        <CCol xs="12" style={{ padding: 0, marginBottom: "30px" }}>
          <PageHeader heading="Horários de despacho" />
        </CCol>
        <RequiredFilters />
        <CCard>
          <CCardHeader>
            <h4>Meus horários de envio</h4>
            <p>
              Despache suas vendas antes do horário máximo indicado diariamente e evite atrasos.&nbsp;
              <a
                target="_blank"
                rel="noreferrer"
                className="text-info"
                href="https://vendedores.mercadolivre.com.br/nota/despache-suas-vendas-no-prazo-a-chave-para-uma-boa-reputacao/"
              >
                Mais informações.
              </a>
            </p>
          </CCardHeader>
          <CCardBody>
            <ScheduleList />
          </CCardBody>
        </CCard>
      </Provider>
    </CContainer>
  );
};

export default ShippingSchedule;
