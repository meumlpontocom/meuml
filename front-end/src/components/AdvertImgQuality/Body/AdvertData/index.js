import React from "react";
import Callout from "../../../Callout";
import Row from "reactstrap/lib/Row";
import context from "../../imageQualityContext";
import getListingTypes from "../../../../helpers/getListingTypes";
import formatMoney from "../../../../helpers/formatMoney";

export default function AdvertData() {
  const {
    free_shipping,
    id,
    listing_type_id,
    price,
    sold_quantity,
    status,
    title,
  } = React.useContext(context);
  return (
    <Row>
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Título"
        value={title}
      />
      <Callout col={{ xs: 12, sm: 6, md: 6, lg: 6 }} title="Id" value={id} />
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Preço"
        value={formatMoney(price)}
      />
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Frete Grátis"
        value={free_shipping ? "Sim" : "Não"}
      />
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Status"
        value={
          status === "paused"
            ? "Pausado"
            : status === "closed"
            ? "Finalizado"
            : status === "active"
            ? "Ativo"
            : "Em revisão"
        }
      />
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Vendidos"
        value={sold_quantity}
      />
      <Callout
        col={{ xs: 12, sm: 6, md: 6, lg: 6 }}
        title="Tipo"
        value={getListingTypes(listing_type_id)}
      />
    </Row>
  );
}
