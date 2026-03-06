import React, { useMemo } from "react";
import { useSelector }    from "react-redux";
import useSelection       from "../../hooks/useSelection";

const Accounts = () => {
  const { selectedAds } = useSelection();
  const accounts        = useSelector((reduxStore) => reduxStore.accounts.accounts);
  const accountsNames   = useMemo(() => [
    ...new Set(Object.values(selectedAds)
      .map(({ account_id }) => accounts[account_id].name))]
      .join(", ")
  , [accounts, selectedAds]);
  return accountsNames?.length 
    ? (
    <h5>Conta{accountsNames.match(",") ? "s" : ""}: {accountsNames}</h5>
    ) : <></>;
}

export default Accounts;
