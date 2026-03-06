import React, { useMemo, useState } from "react";
import CardHeader from "./components/CardHeader";
import TipAlert from "./components/TipAlert";
import EmailInput from "./components/EmailInput";
import InformHashBtn from "./components/InformHashBtn";
import SubmitBtn from "./components/SubmitBtn";
import { Provider } from "./passwordRecoveryContext";
import GoBackBtn from "../UpdatePassword/components/GoBackBtn";
import { CCard, CCardBody, CCardFooter, CCol, CContainer, CRow } from "@coreui/react";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [hasHash, setHasHash] = useState(false);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[\w.-]+@[\w-]+(?:\.[\w-]+)*(?:\.[a-zA-Z]{2,})+$/;
    return emailRegex.test(email);
  }, [email]);

  return (
    <Provider value={{ email, setEmail, hasHash, setHasHash, isValidEmail }}>
      <CContainer>
        <CRow className="d-flex justify-content-center">
          <CCol xs={12} md={6}>
            <CCard style={{ top: "20%" }} className="fade-in">
              <CCardBody style={{ paddingBottom: 0 }}>
                <CardHeader />
                <CRow>
                  <CCol xs={12}>
                    <TipAlert />
                  </CCol>
                  <CCol xs={12}>
                    <EmailInput />
                  </CCol>
                  <CCol xs={12} className="mt-3 text-center">
                    <InformHashBtn />
                  </CCol>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol xs={12}>
                    <SubmitBtn />
                  </CCol>
                  <CCol xs={12}>
                    <GoBackBtn />
                  </CCol>
                </CRow>
              </CCardFooter>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </Provider>
  );
};

export default PasswordRecovery;
