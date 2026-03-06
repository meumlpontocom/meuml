import React                  from "react";
import { useSelector }        from "react-redux";
import { CAlert, CCol, CRow } from "@coreui/react";
import { Link }               from "react-router-dom";

const NoAccountAlert = () => {
  const accounts = useSelector(state => state.accounts.accounts);
  return Object.values(accounts).length ? (
    <></>
  ) : (
    <CRow>
      <CCol>
        <CAlert color="warning">
          <h4>Nenhuma conta cadastrada!</h4>
          <em>
            Adicione suas contas do Mercado Livre e Shopee para utilizar os&nbsp;
            <Link to="/assinaturas/planos">serviços exclusivos</Link> MeuML.com!
          </em>
        </CAlert>
      </CCol>
    </CRow>
  );
}

export default NoAccountAlert;
