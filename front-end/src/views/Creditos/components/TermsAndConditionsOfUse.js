import React from "react";
import { CCard, CCardBody, CCardFooter, CCardHeader, CCol } from "@coreui/react";
import { FaCopy, FaCreditCard, FaMedal } from "react-icons/fa";
import { Link } from "react-router-dom";
import RepeatIcon from "src/assets/icons/RepeatIcon";
import { ReactComponent as ShopeeLogo } from "src/assets/icons/shopee.svg";
import { ReactComponent as MercadoLibreLogo } from "src/assets/icons/mercado-livre.svg";

const TermsAndConditionsOfUse = () => {
  return (
    <CCol xs="12">
      <CCard>
        <CCardHeader className="text-center bg-light text-dark shadow-sm">
          <h4>Atenção</h4>
        </CCardHeader>
        <CCardBody className="d-flex text-center align-items-center">
          <CCol>
            <MercadoLibreLogo width={80} height={80} />
          </CCol>
          <div style={{ width: "1px", backgroundColor: "#DFDFDF", height: "100px" }}>&nbsp;</div>
          <CCol>
            <ShopeeLogo width={70} height={70} />
          </CCol>
        </CCardBody>
        <CCardFooter>
          <p>
            <RepeatIcon width="14" className="mr-1" color="info" />
            Os créditos são destinados exclusivamente para a replicação de anúncios. Confira abaixo as opções
            possívels
          </p>
          <p>
            <FaCreditCard className="text-info mb-1 mr-1" />
            <strong>O custo da replicação é de R$0,25 (vinte e cinco centavos) por anúncio.&nbsp;</strong>
            Após o pagamento realizado, não é possível cancelar a compra. Só efetue o pagamento se estiver
            ciente sobre como funciona o serviço. Não é possível fazer devolução de pagamento realizado.
          </p>
          <p>
            <FaMedal className="text-info mb-1 mr-1" />
            Para outros serviços do MeuML.com, consulte nossas assinaturas clicando&nbsp;
            <Link from="/creditos/comprar" to="/assinaturas/planos">
              aqui.
            </Link>
          </p>
          <p>
            <strong>
              <FaCopy className="text-info mb-1 mr-1" /> Nossas opções de replicação:
            </strong>
            <ul>
              <li>Mercado Livre para Mercado Livre (anúncios próprios)</li>
              <li>Shopee para Shopee (anúncios próprios)</li>
              <li>Shopee para Mercado Livre (anúncios próprios, somente um de cada vez)</li>
              <li>Mercado Livre para Shopee (anúncios próprios)</li>
            </ul>
          </p>
        </CCardFooter>
      </CCard>
    </CCol>
  );
};

export default TermsAndConditionsOfUse;
