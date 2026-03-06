import React           from "react";
import { useSelector } from "react-redux";
import { CRow }        from "@coreui/react";
import AccountCard     from "../../../../components/AccountCard";

const AccountList = () => {
  const accounts = useSelector(state => state.accounts.accounts);
  return !Object.values(accounts).length ? (
    <></>
  ) : (
    <CRow>
      {
        Object.values(accounts).map(account => {
          return (
            <AccountCard {...account} />
          );
        })
      }
    </CRow>
  );
};

export default AccountList;
