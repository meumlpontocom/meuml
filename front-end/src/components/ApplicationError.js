import React, { useCallback, useState } from "react";
import { FaTimesCircle }                from "react-icons/fa";
import {
  CCard, CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner
}                                       from "@coreui/react";

const ApplicationError = () => {
  const [isLoading, setIsLoading] = useState(false);

  const clearCache = useCallback(async () => {
    setIsLoading(true);
    caches.keys().then(function (cacheNames) {
      if (cacheNames?.length) {
        cacheNames.forEach(function (cacheName) {
          caches.delete(cacheName);
        });
      }
      localStorage.clear();
      window.location.assign("/");
    });
    setIsLoading(false);
  }, [setIsLoading]);

  const Link = ({ children, onClick }) => (
    <span className="text-info pointer" onClick={onClick}>
      {children}
    </span>
  );
  const PageRefresh = ({ children }) => (
    <Link onClick={() => window.location.reload(true)}>
      {children}
    </Link>
  );
  const CacheReset = ({ children }) => (
    <Link onClick={() => clearCache()}>
      {children}
    </Link>
  );
  return (
    <CContainer style={{ height: "100%" }}>
      <CRow className="d-flex justify-content-center align-items-center">
        <CCol style={{ top: isLoading ? "50vh" : "30vh" }} className={isLoading && "d-flex justify-content-center"}>
          {isLoading ? (
            <CSpinner />
          ) : (
            <CCard>
              <CCardHeader>
                <h1 className="text-danger">
                  <FaTimesCircle />&nbsp;Erro
                </h1>
              </CCardHeader>
              <CCardBody>
                <h2>Ooops!</h2>
                <p>Parece que algo deu errado. Atualize a página clicando <PageRefresh>aqui</PageRefresh>.</p>
                <p>Se você já fez isso e o erro continua, tente fazer login novamente clicando <CacheReset>aqui</CacheReset>.</p>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ApplicationError;
