import React, { useContext } from "react";
import { PlanSignUpContext } from "../../PlanSignUpContext";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import { WarningPersonalizationTip, WarningAccountsSelected } from "../../Warnings";
import PlansList from "./PlansList";
import ModulesList from "../ModulesList";

const MercadoLivreCard = () => {
  const { selectedPlan, allSelectedAccounts } = useContext(PlanSignUpContext);

  return (
    <CCard>
      <CCardHeader className="bg-dark text-white">
        <h5 className="mb-0">Selecione um plano abaixo (Mercado Livre)</h5>
        <WarningAccountsSelected platform="ML" selectedAccounts={allSelectedAccounts} />
      </CCardHeader>
      <CCardHeader>
        <form>
          <PlansList />
        </form>
      </CCardHeader>
      {Object.keys(selectedPlan).length !== 0 && (
        <>
          <CCardBody>
            <WarningPersonalizationTip />
            <ModulesList platform="ML" />
          </CCardBody>
        </>
      )}
    </CCard>
  );
};

export default MercadoLivreCard;
