import { CCard, CCardBody, CCardFooter, CCol, CImg, CRow } from "@coreui/react";
import ButtonComponent from "src/components/ButtonComponent";
import SygnetImg from "src/assets/img/brand/sygnet.png";

export const AppMeuMLCard = () => {
  const handleDownloadAPK = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.grimpatech.meuml_mobile&hl=pt_BR",
      "_blank",
    );
  };

  return (
    <CCard className="text-center">
      <CCardBody className="p-2">
        <div className="text-value-lg d-flex align-items-center justify-content-center">
          <i className="cil-cloud-download mx-3" />
          Aplicativo MeuML
        </div>
      </CCardBody>
      <CCardFooter className="p-3">
        <CRow>
          <CCol xs={12} sm={6} md={6} lg={6} xl={6} style={{ textAlign: "left" }} className="mb-4">
            <i className="cil-check" /> Você pode responder perguntas de todas as suas contas do Mercado Livre
            pelo mesmo aplicativo!
            <br />
            <br />
            <i className="cil-check" /> Funcionalidade exclusiva para contas do Mercado Livre. Assine o módulo
            de perguntas e tenha acesso pelo aplicativo Android!
            <br />
            <br />
            <i className="cil-check" /> Utilize o mesmo email e senha para entrar no aplicativo. Somente para
            Android.
          </CCol>
          <CCol
            xs={12}
            sm={6}
            md={6}
            lg={6}
            xl={6}
            className="d-flex justify-content-center align-items-center"
          >
            <CCol
              xs={12}
              style={{
                flexDirection: "column",
              }}
            >
              <CImg src={SygnetImg} width={100} className="mb-3" />
              <CCol className="d-flex justify-content-center">
                <ButtonComponent title="Download" icon="cil-cloud-download" onClick={handleDownloadAPK} />
              </CCol>
            </CCol>
          </CCol>
        </CRow>
      </CCardFooter>
    </CCard>
  );
};
