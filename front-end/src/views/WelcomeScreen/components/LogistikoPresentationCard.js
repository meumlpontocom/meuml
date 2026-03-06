import { CCard, CCardBody, CCol, CRow } from "@coreui/react";

export const LogistikoPresentationCard = () => {
  return (
    <CRow className="d-flex align-items-center justify-content-center">
      <CCol xl="12">
        <CCard className="p-4">
          <CRow>
            <CCol md="4" className="d-flex justify-content-center align-items-center">
              <img
                src="https://logistiko.com.br/images/logo.svg"
                alt="Logistiko Logo"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </CCol>
            <CCol md="8">
              <CCardBody>
                <h2 style={{ fontWeight: "bold" }}>Novo Sistema de Controle de Estoque Integrado</h2>
                <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  Temos um novo sistema de Controle de Estoque integrado ao Mercado Livre! Para você que tem 2
                  ou mais contas vendendo os mesmos produtos, esse sistema é ideal para controlar seu estoque.
                </p>
                <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
                  Quando uma unidade é vendida em uma conta, o sistema automaticamente dá baixa no estoque em
                  todas as suas outras contas também.
                </p>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>
                  Conheça mais em:{" "}
                  <a
                    href="https://logistiko.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-info"
                  >
                    logistiko.com.br
                  </a>
                </p>
              </CCardBody>
            </CCol>
          </CRow>
        </CCard>
      </CCol>
    </CRow>
  );
};
