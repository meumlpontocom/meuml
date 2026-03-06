import React                                   from "react";
import { FaWhatsapp }                          from "react-icons/fa";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";

const AlertContactList = () => {
  const WhatsAppTopic = ({ content }) => (
    <p className="mt-1">
      <FaWhatsapp className="mb-1 text-success" />
      &nbsp;{content}
    </p>
  );
  const SubTitle = ({ content }) => (
    <small className="text-muted">{content}</small>
  );
  return (
    <CCol xs="12">
      <CCard className="animated fadeIn">
        <CCardHeader className="bg-warning">
          <h3>Primeiro passo</h3>
        </CCardHeader>
        <CCardBody>
          <h5>
            Adicione o número para <em>suporte (ajuda)</em> nos seus contatos:
          </h5>
          <SubTitle content="Para pedir ajuda sobre uso das ferramentas, sobre pagamentos, entre outros." />
          <WhatsAppTopic content="+55 (41) 99123-0100" />
          <h5>Então adicione o número que lhe enviará <em>notificações</em>:</h5>
          <SubTitle content={
            <span>
              Receba notificações do MeuML sobre suas contas.
              <strong>&nbsp;Atenção! Este número não atende como suporte. Apenas envia notificações.</strong>
            </span>
          } />
          <WhatsAppTopic content="+55 (41) 99123-0101" />
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default AlertContactList;
