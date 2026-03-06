import React              from "react";
import { CListGroupItem } from "@coreui/react";
import AccountInfoStyles  from "./AccountInfoStyles";
import MarketPlaceStyles  from "./MarketPlaceStyles";

const AccountInfoItem = ({ accountName, platform, accountPlans }) => {
  // set plans to only unique values to avoid duplicated plan names
  // "ES6 Set" only lets you store unique values
  const plans = [...new Set(accountPlans)]; // convert Set back to an array using spread operator

  let marketPlace = "Mercado Livre";
  if (platform === "SP") {
    marketPlace = "Shopee";
  }

  return (
    <CListGroupItem
      accent="secondary"
      color="secondary"
      className="rounded mb-1"
    >
      <AccountInfoStyles>
        <strong>{accountName}</strong>
        <span className="account-plan text-muted font-weight-bold">
          {plans.join(", ")}
        </span>
        <MarketPlaceStyles>{marketPlace}</MarketPlaceStyles>
      </AccountInfoStyles>
    </CListGroupItem>
  );
};

export default AccountInfoItem;
