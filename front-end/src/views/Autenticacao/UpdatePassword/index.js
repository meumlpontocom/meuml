import React, { useMemo, useState } from "react";
import classNames                   from "classnames";
import { useHistory }               from "react-router-dom";
import { Provider }                 from "./updatePasswordContext";
import CardHeader                   from "./components/CardHeader";
import TipAlert                     from "./components/TipAlert";
import EmailInput                   from "./components/EmailInput";
import HashInput                    from "./components/HashInput";
import PasswordInput                from "./components/PasswordInput";
import ConfirmPasswordInput          from "./components/ConfirmPasswordInput";
import SubmitBtn                    from "./components/SubmitBtn";
import CancelBtn                    from "./components/GoBackBtn";
import { 
  CCard, 
  CCardBody, 
  CCardFooter, 
  CCol, 
  CContainer, 
  CRow 
}                                   from "@coreui/react";

const UpdatePassword = () => {
  const { location: { pathname } } = useHistory();

  const email = useMemo(() => pathname.split("/")[2], [pathname]);
  const [hash,            setHash]           = useState("");
  const [password,        setPassword]       = useState("");
  const [confirmPassword,  setConfirmPassword] = useState("");

  const passwordIsValid = classNames(
    password && confirmPassword && password === confirmPassword && "is-valid",
  );
  const hashIsValid = classNames(
    !!hash ? String(hash).length === 32 ? "is-valid" : "is-invalid" : ""
  );

  return (
    <Provider value={{ 
      email,
      hash,
      setHash,
      hashIsValid,
      password,
      setPassword,
      confirmPassword,
      setConfirmPassword,
      passwordIsValid
    }}>
      <CContainer>
        <CRow className="d-flex justify-content-center">
          <CCol xs={12} md={6}>
            <CCard style={{ top: "25px" }} className="fade-in">
              <CCardBody>
                <CardHeader />
                <CRow>
                  <CCol xs={12}>
                    <TipAlert />
                  </CCol>
                  <CCol xs={12}>
                    <EmailInput />
                  </CCol>
                  <CCol xs={12} className="mt-2">
                    <HashInput />
                  </CCol>
                  <CCol xs={12} className="mt-2">
                    <PasswordInput />
                  </CCol>
                  <CCol xs={12} className="mt-2">
                    <ConfirmPasswordInput />
                  </CCol>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CRow>
                  <CCol xs={12}>
                    <SubmitBtn />
                  </CCol>
                  <CCol xs={12}>
                    <CancelBtn />
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

export default UpdatePassword;
