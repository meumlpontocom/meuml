import React from "react";
import { CAlert } from "@coreui/react";
import { Link } from "react-router-dom";

export const WarningMessageCredits = () => {
  return (
    <>
      <CAlert color="warning" className="mt-3 text-left">
        <h4 className="d-flex align-items-center">
          <i className="cil-warning mr-2" />
          Atenção!
        </h4>
        <p>
          Nenhuma das assinaturas disponíveis contempla o recurso de replicação de anúncios.
          <br />A replicação de anúncios é feita com Créditos.
        </p>
        <hr />
        <p>
          <strong>
            Você pode adquirir créditos para a replicação <Link to="/creditos/comprar">clicando aqui</Link>.
          </strong>
        </p>
      </CAlert>
    </>
  );
};

export const WarningMessagePayment = () => {
  return (
    <>
      <CAlert color="info" className="mt-3">
        <h6 className="d-flex align-items-center">Valores mínimos de pagamento:</h6>
        <h6 className="d-flex align-items-center">
          <i className="cil-featured-playlist mr-2" />
          PIX: R$ 20,00
        </h6>
      </CAlert>
    </>
  );
};

export const WarningPersonalizationTip = () => {
  return (
    <>
      <CAlert color="info">
        <h6 className="d-flex align-items-center mb-0 text-center">
          <i className="cil-lightbulb mr-2" />
          Dica: personalize adicionando os módulos que você precisar!
        </h6>
      </CAlert>
    </>
  );
};

export const WarningAccountsSelected = ({ selectedAccounts, platform }) => {
  const numberOfAccounts = selectedAccounts.filter(account => account.platform === platform).length;
  const platformName = platform === "ML" ? "Mercado Livre" : platform === "SP" ? "Shopee" : "";

  return (
    <>
      <CAlert color="info" className="mt-3">
        <h6 className="d-flex align-items-center mb-0 text-center">
          <i className="cil-arrow-circle-right mr-2" />
          Contas {platformName} selecionadas: <strong className="ml-1">{numberOfAccounts}</strong>
        </h6>
      </CAlert>
    </>
  );
};
