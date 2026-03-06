import React from "react";
import WarningCard from "./WarningCard";

export default function PriceUpdate() {
  return (
    <WarningCard type="warning">
      A Shopee está proibindo anúncios idênticos - mesmo que seja em contas
      diferentes - por isso pedimos que você altere o preço dos anúncios em pelo
      menos 1 centavo. Aumente ou diminua o preço como quiser aqui por esta
      opção!
    </WarningCard>
  );
}
