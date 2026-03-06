import React, { useContext } from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import { WarningAccountsSelected } from "../../Warnings";
import ModulesList from "../ModulesList";
import { PlanSignUpContext } from "../../PlanSignUpContext";

const ShopeeCard = () => {
  const { allSelectedAccounts } = useContext(PlanSignUpContext);

  return (
    <CCard>
      <CCardHeader className="bg-dark text-white">
        <h5 className="mb-0">Selecione módulos abaixo (Shopee)</h5>
        <WarningAccountsSelected selectedAccounts={allSelectedAccounts} platform="SP" />
      </CCardHeader>
      <CCardBody>
        <ModulesList platform="SP" />
      </CCardBody>
    </CCard>
  );
};

export default ShopeeCard;
