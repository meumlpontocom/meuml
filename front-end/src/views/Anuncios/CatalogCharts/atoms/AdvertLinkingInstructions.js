import React            from "react";
import { useHistory }   from "react-router";
import { CAlert, CCol } from "@coreui/react";

const AdvertLinkingInstructions = () => {
  const { location } = useHistory();

  return location.state ? (
    <CCol xs="12" style={{ padding: 0 }}>
      <CAlert color="warning">
        Selecione uma medida (linha tabela) para associar ao(s) anúncio(s) selecionado(s)
      </CAlert>
    </CCol>
  ) : <></>;
};

export default AdvertLinkingInstructions;