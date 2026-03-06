import React from "react";
import Header from "./Header";
import Body from "./Body";
import { CCard, CCol } from "@coreui/react";
import "./index.scss";

const AccountCard = ({ ...account }) => {
  return (
    <CCol xs="12" sm="6" md="4" lg="4" xl="3" className="card-width">
      <CCard id={account.id} className="account-card rounded-sm mx-2 p-0">
        <Header account={account} />
        <Body id={account.id} />
      </CCard>
    </CCol>
  );
};

export default AccountCard;
