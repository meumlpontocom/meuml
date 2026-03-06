import React from "react";
import { CAlert } from "@coreui/react";
import { CIcon } from "@coreui/icons-react";

export default function ReplicationRules() {
  return (
    <CAlert color="warning">
      <h4>
        <span className="mr-3">
          <CIcon size={"lg"} name={"cilWarning"} />
        </span>
        Atenção!
      </h4>

      <hr />
      <p>
        A Shopee não permite criação de anúncios idênticos - mesmo que seja em
        contas diferentes - por isso pedimos que você altere o preço ou o título
        dos anúncios selecionados.
      </p>
      <hr />
      <p>
        <em>
          <b>
            Você tem a opção de complementar o título do anúncio ou alterar o
            preço em pelo menos 1 centavo.
          </b>
        </em>
      </p>
    </CAlert>
  );
}
