import { CAlert } from "@coreui/react";
import React    from "react";
import { Link } from "react-router-dom";

const CatalogChartsAlert = () => {
  return (
    <CAlert color="warning">
      <p>
        Este anúncio requer uma tabela de medidas. <strong>Escolha</strong> uma no{" "}
        <strong>menu abaixo</strong> ou então <Link to="/tabela-medidas">crie uma nova</Link> antes de
        prosseguir.
      </p>
    </CAlert>
  );
};

export default CatalogChartsAlert;
