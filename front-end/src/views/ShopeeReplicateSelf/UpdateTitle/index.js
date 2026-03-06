import React from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CLabel,
  CInput,
  CAlert,
} from "@coreui/react";

const UpdateTitle = ({ setTitleAppendString }) => {
  return (
    <>
      <CCard>
        <CCardHeader className="bg-gradient-dark text-white">
          <h5>Complementar título do anúncio</h5>
        </CCardHeader>
        <CCardBody>
          <CCol className="mb-3">
            <CLabel>
              Digite um texto para ser inserido ao final do título original
            </CLabel>
            <CInputGroup>
              <CInputGroupPrepend>
                <CInputGroupText>Título</CInputGroupText>
              </CInputGroupPrepend>
              <CInput
                onChange={(event) => setTitleAppendString(event.target.value)}
                className="block"
                type="text"
                id="append-advert-title"
                name="append-advert-title"
                placeholder="Digite aqui . . ."
                maxLength="50"
              />
            </CInputGroup>
            <CAlert className="mt-3" color="info">
              <h6>Exemplo:</h6>
              <p>
                Considerando o nome do anúncio original como:&nbsp;
                <em>Balas Fini Amoras 15g</em> e o texto digitado acima
                for:&nbsp;
                <em>PROMOÇÃO</em>, o título final ficará:&nbsp;
                <b>
                  <em>Balas Fini Amoras 15g PROMOÇÃO</em>
                </b>
              </p>
            </CAlert>
          </CCol>
        </CCardBody>
      </CCard>
    </>
  );
};

export default UpdateTitle;
