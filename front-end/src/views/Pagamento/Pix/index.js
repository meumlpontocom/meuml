import React, { useCallback, useEffect, useState } from "react";
import Swal                                        from "sweetalert2";
import { useSelector }                             from "react-redux";
import { FaArrowCircleLeft, FaCheckCircle }        from "react-icons/fa";
import Form                                        from "../Boleto/Form";
import { FaArrowAltCircleRight }                   from "react-icons/fa";
import { useHistory }                              from "react-router-dom";
import formatMoney                                 from "../../../helpers/formatMoney";
import PageHeader                                  from "../../../components/PageHeader";
import SelectDocumentType                          from "../Cartao/Form/SelectDocumentType";
import PaymentWarningMessage                       from "../../../components/PaymentWarningMessage";
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CCardFooter, CRow, CCol, CAlert, CButton, 
  CModal, CModalHeader, CModalBody, CSpinner,
}                                                  from "@coreui/react";
import ErrorBoundary from "src/components/ErrorBoundary";

const Pix = () => {
  const history = useHistory();
  const [loading, setLoading]           = useState(false);
  const [formStage, setFormStage]       = useState(0);
  const [documentType, setDocumentType] = useState("");
  const payments = useSelector((state) => ({
    ...state.payments,
    totalFormatted: formatMoney(state.payments.total),
  }));

  const selectDocumentType = useCallback((type) => {
    setDocumentType(type);
    setFormStage(c => c + 1);
  }, []);

  useEffect(() => {
    Swal.fire({
      title: "Atenção!",
      type: "warning",
      text: "Os pagamentos via PIX podem demorar até 20 minutos para ser aprovados.",
      showCloseButton: true,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: "Entendi!"
    });
  }, []);

  useEffect(() => {
    if (!payments.total > 0) history.goBack();
    if (payments?.total < 20) {
      Swal.fire({
        title: "Atenção",
        type: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Ver planos",
        cancelButtonText: "Cancelar",
        html:
          "<p>Você precisa realizar um pedido de no mínimo R$20 para fazer pagamento via boleto.</p>", 
      }).then((opt) => history.goBack()); 
    }
  }, [history, payments.total]);

  const handleBtnClick = useCallback(({ target: { id } }) => {
    if (formStage === 0 && id === "goback") history.goBack();
    else setFormStage(c => id === "goback" ? c - 1 : c + 1);
  }, [formStage, setFormStage, history]);

  return (
    <CContainer>
      <PageHeader heading="Pagamento" />
      <CCard>
        <CCardHeader>
          <h3>PIX</h3>
        </CCardHeader>
        <CCardBody>
          <>
            <CModal show={loading} centered>
              <CModalHeader>
                <h3>Pagamento P I X</h3>
              </CModalHeader>
              <CModalBody className="text-center">
                <p>Por favor, aguarde enquanto a cobrança é gerada.</p>
                <CSpinner size="lg" color="primary" />
              </CModalBody>
            </CModal>
          </>
          {!formStage ? (
            <>
              <CAlert color="danger">
                <h5>
                  Caros usuários,
                </h5>
                Devido às frequentes tentativas de golpe que o MeuML.com
                sofreu, não aceitamos mais pagamentos via cartão de crédito.
                <br />
                Agora os <strong>pagamentos devem ser realizados
                                 exclusivamente
                                 através do PIX.&nbsp;</strong>
                <br />
                Não compre antes de ter certeza sobre o serviço que está
                adquirindo. Qualquer dúvida entre em contato pelo <a
                href="https://wa.me/554191230100"
                target="_blank" rel="noreferrer"
              >suporte via Whatsapp</a>.
              </CAlert>
            </>
          ) : formStage === 1 ? (
            <ErrorBoundary>
              <PaymentWarningMessage />
            </ErrorBoundary>
          ) : formStage === 2 ? (
            <ErrorBoundary>
              <SelectDocumentType selectDocumentType={selectDocumentType} />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <Form
                payments={payments}
                documentType={documentType}
                setLoading={setLoading}
                setFormStage={setFormStage}
              />
            </ErrorBoundary>
          )}
        </CCardBody>
        {formStage < 2 && (
          <CCardFooter>
            <CCol xs={12}>
              <CRow className="d-flex justify-content-between">
                <CCol xs={12} sm={6}>
                  <CButton
                    color="light"
                    size="lg"
                    id="goback"
                    onClick={handleBtnClick}
                  >
                    <FaArrowCircleLeft className="mb-1" />&nbsp;Voltar
                  </CButton>
                </CCol>
                <CCol xs={12} sm={6} className="text-right">
                  <CButton
                    color="success"
                    size="lg"
                    id="next"
                    onClick={handleBtnClick}
                  >
                    {formStage > 0 && <FaCheckCircle className="mb-1 mr-1" />}
                    {
                      formStage === 0
                        ? "Continuar"
                        : formStage === 1
                          ? "Confirmo que li e concordo com os Termos de Uso."
                          : "Finalizar"
                    }
                    {formStage === 0 &&
                      <FaArrowAltCircleRight className="mb-1 ml-1" />}
                  </CButton>
                </CCol>
              </CRow>
            </CCol>
          </CCardFooter>
        )}
      </CCard>
    </CContainer>
  );
};

export default Pix;
