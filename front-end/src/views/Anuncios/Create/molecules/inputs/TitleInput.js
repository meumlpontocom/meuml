import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { CCardBody, CPopover } from "@coreui/react";
import { FaHandPointRight, FaHeading } from "react-icons/fa";
import { Card, CardHeader, Input } from "src/views/Anuncios/Create/atoms";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const TitleInput = () => {
  const createAdvertContext = useContext(createMlAdvertContext);
  const selectedAccounts = useSelector(state => state.accounts.selectedAccounts);
  const setFormData = createAdvertContext.setFormData;
  return (
    <Card isVisible={selectedAccounts.length >= 1} className="border-primary" id="advert-title-card">
      <CardHeader
        title="Título do anúncio"
        subtitle={
          <CPopover content="Clique aqui para saber como criar um bom título">
            <a
              className="text-info"
              target="_blank"
              rel="noopener noreferrer"
              id="how_to_create_title_link"
              name="Como criar um bom título"
              href="https://www.mercadolivre.com.br/ajuda/Escrever-um-bom-titulo-e-descricao_677"
            >
              <FaHandPointRight className="mr-2 text-secondary" />
              Um bom título
            </a>
          </CPopover>
        }
      />
      <CCardBody>
        <Input
          id="title"
          name="advert-title-input"
          size="lg"
          prepend={<FaHeading />}
          type="text"
          placeholder="Ex.: iPhone 7 32 GB Preto-fosco Novo"
          value={createAdvertContext.form.title}
          onChange={({ target: { id, value } }) => setFormData({ id, value })}
        />
      </CCardBody>
    </Card>
  );
};

export default TitleInput;
