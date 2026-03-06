import React, { useContext }    from "react";
import { CCard, CCardBody }     from "@coreui/react";
import CardHeader               from "../atoms/CardHeader";
import { catalogChartsContext } from "../catalogChartsContext";
import SelectAccounts           from "src/components/SelectAccounts";

const SelectAccount = () => {
  const { selectedAccount, setAccount} = useContext(catalogChartsContext);
  return (
    <CCard>
      <CardHeader text="Conta Mercado Livre" />
      <CCardBody>
        <SelectAccounts
          platform="ML"
          callback={setAccount}
          selected={selectedAccount}
          placeholder="Selecionar uma conta"
        />
      </CCardBody>
    </CCard>
  );
};

export default SelectAccount;
