import React, { useMemo, useState } from "react";
import AppLogo from "./components/AppLogo";
import TipAlert from "./components/TipAlert";
import GoBackBtn from "./components/GoBackBtn";
import SubmitBtn from "./components/SubmitBtn";
import useConfirmationForm from "./hooks/useConfirmationForm";
import ResendHashEmailBtn from "./components/ResendHashEmailBtn";
import { CCard, CCardBody, CCardFooter, CCol, CContainer, CFormGroup, CRow } from "@coreui/react";
import HashInputSimple from "./components/HashInputSimple";

const ConfirmarCadastro = () => {
  const [handleSubmit, history] = useConfirmationForm();
  const [hash, setHash] = useState("");
  const email = useMemo(() => history.location.pathname.split("/")[2], [history.location.pathname]);

  return (
    <div className="app flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="6" style={{ top: "20vh" }}>
            <CCard className="col-md-12">
              <CCardBody className="text-center">
                <AppLogo />
                <CFormGroup>
                  <h2 className="mb-5 text-dark">Confirmar Cadastro</h2>
                  <TipAlert email={email} />
                  <HashInputSimple hash={hash} setHash={setHash} />
                  <ResendHashEmailBtn email={email} />
                </CFormGroup>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol xs={12} sm={6}>
                    <GoBackBtn />
                  </CCol>
                  <CCol className="text-right" xs={12} sm={6}>
                    <SubmitBtn hash={hash} email={email} handleSubmit={handleSubmit} />
                  </CCol>
                </CRow>
              </CCardFooter>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default ConfirmarCadastro;
