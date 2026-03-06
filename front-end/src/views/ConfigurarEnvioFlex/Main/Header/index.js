import React from "react";
import LastUpdateDate from "./LastUpdateDate";
import CardHeader from "reactstrap/lib/CardHeader";
import PageHeader from "src/components/PageHeader";
import { useSelector } from "react-redux";

export default function Header() {
  const accountId = window.location.href.split(
    "/#/configurar-envio-flex/"
  )?.[1];
  const accountName = useSelector(
    (state) => state.accounts.accounts[accountId]?.external_name
  );
  return (
    <>
      <PageHeader
        heading="Configurar Envio Flex na Conta"
        subheading={accountName && accountName}
      />
      <CardHeader className="mb-n1">
        <LastUpdateDate className="mb-1" />
      </CardHeader>
    </>
  );
}
