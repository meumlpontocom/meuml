import { useContext, useEffect, useMemo } from "react";
import paymentContext                     from "src/views/Payment/paymentContext";
import { setUserCpfCnpj }                 from "src/views/Payment/actions/setUserData";
import { setPayerDataFormTab }            from "src/views/Payment/actions/setPayerData";
import {
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTabs,
} from "@coreui/react";

function Tabs({ CpfForm, CnpjForm }) {
  const { state, dispatch } = useContext(paymentContext);

  const cnpj = useMemo(() => {
    return state.payerDataHistory.filter(
      (form) => form.cpf_cnpj?.length <= 18 && form.cpf_cnpj?.length > 14
    )[0]?.cpf_cnpj;
  }, [state.payerDataHistory]);

  const cpf = useMemo(() => {
    return state.payerDataHistory.filter(
      (form) => form.cpf_cnpj?.length <= 14 && form.cpf_cnpj?.length > 11
    )[0]?.cpf_cnpj;
  }, [state.payerDataHistory]);

  useEffect(() => {
    switch (state.payerFormSelectedTab) {
      case "cnpj":
        if (cnpj) dispatch(setUserCpfCnpj(cnpj));
        break;

      default:
        if (cpf) dispatch(setUserCpfCnpj(cpf));
        break;
    }
  }, [cnpj, cpf, dispatch, state.payerFormSelectedTab]);

  return (
    <>
      <CTabs
        activeTab={state.payerFormSelectedTab}
        onActiveTabChange={(tab) => dispatch(setPayerDataFormTab(tab))}
      >
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="cpf">CPF</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="cnpj">CNPJ</CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane data-tab="cpf">{CpfForm()}</CTabPane>
          <CTabPane data-tab="cnpj">{CnpjForm()}</CTabPane>
        </CTabContent>
      </CTabs>
    </>
  );
}

export default Tabs;
