import React, { useContext }   from "react";
import { CLabel }              from "@coreui/react";
import shippingScheduleContext from "../shippingScheduleContext";
import SelectAccounts          from "src/components/SelectAccounts";

const AccountSelect = () => {
  const { selectedAccount, handleSelectAccount } = useContext(shippingScheduleContext);
  return (
    <>
      <CLabel>
        Selecione uma conta
      </CLabel>
      <SelectAccounts
        multipleSelection={false}
        selected={selectedAccount}
        callback={handleSelectAccount}
        placeholder="Selecione uma conta"
        />
    </>
  );
};

export default AccountSelect;
