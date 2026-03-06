import React, { useContext, useMemo } from "react";
import classNames from "classnames";
import { FaCreditCard } from "react-icons/fa";
import creditsContext from "../creditsContext";
import TicketErrorMessage from "./TicketErrorMessage";
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormGroup,
  CLabel,
  CInput,
  CInputCheckbox,
  CInputGroup,
  CInputGroupText,
  CInputGroupAppend,
  CInputGroupPrepend,
} from "@coreui/react";
import PixTipAlert from "./PixTipAlert";

const OrderForm = () => {
  const { showForm, orderValue, paymentMode, showTicketWarning, setPaymentMode, setOrderValue } =
    useContext(creditsContext);

  const coastPerAdvertReplicated = 0.25;
  const orderValueDividedByReplicationCoast = useMemo(
    () => orderValue / coastPerAdvertReplicated,
    [orderValue],
  );
  const inputClassName = classNames(showTicketWarning ? "is-invalid" : "");

  function handleSelectClick({ target: { id } }) {
    setPaymentMode(id);
  }

  function handleInputChange({ target: { value } }) {
    setOrderValue(value);
  }

  return showForm ? (
    <CCol xs="12" className="fade-in">
      <CCard>
        <CCardHeader className="bg-success text-white shadow-sm">
          <h5>
            <FaCreditCard className="mb-1 mr-1" />
            &nbsp;Comprar créditos
          </h5>
        </CCardHeader>
        <CCardBody>
          <CFormGroup>
            <CCol className="ml-2">
              <CRow>
                <PixTipAlert />
                <CCol xs="12">
                  <CLabel>
                    <CInputCheckbox id="0" checked={paymentMode === "0"} onClick={handleSelectClick} />
                    PIX
                  </CLabel>
                </CCol>
                {/* <CCol xs="12">
                  <CLabel>
                    <CInputCheckbox className="disabled" id="1" checked={false} />
                    <strike>Cartão de crédito</strike>
                  </CLabel>
                </CCol> */}
              </CRow>
            </CCol>
            <CCol xs="12" style={{ padding: 0 }}>
              <CLabel>
                Valor
                <CInputGroup>
                  <CInputGroupPrepend>
                    <CInputGroupText>
                      <strong>R$</strong>
                    </CInputGroupText>
                  </CInputGroupPrepend>
                  <CInput
                    onChange={handleInputChange}
                    className={inputClassName}
                    value={orderValue}
                    type="number"
                  />
                  <CInputGroupAppend>
                    <CInputGroupText>= {orderValueDividedByReplicationCoast} replicações</CInputGroupText>
                  </CInputGroupAppend>
                </CInputGroup>
              </CLabel>
              <TicketErrorMessage error={showTicketWarning} />
            </CCol>
          </CFormGroup>
        </CCardBody>
      </CCard>
    </CCol>
  ) : (
    <></>
  );
};

export default OrderForm;
