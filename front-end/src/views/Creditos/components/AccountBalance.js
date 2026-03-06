import React, { useContext }                         from "react";
import BuyBtn                                        from "./BuyBtn";
import classNames                                    from "classnames";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import { FaCashRegister }                            from "react-icons/fa";
import creditsContext                                from "../creditsContext";
import useAvailableCredits                           from "../hooks/useAvailableCredits";
import LoadingCardData                               from "src/components/LoadingCardData";

const AccountBalance = () => {
  const { showForm } = useContext(creditsContext);
  const [isLoading, availableCredits] = useAvailableCredits();
  const centeredItem = classNames("d-flex", "align-items-center", "justify-content-center");

  const Balance = () => (
    isLoading ? <LoadingCardData /> : <h1>{availableCredits}</h1>
  );

  return (
    <CCol xs="12">
      <CCard>
        <CCardHeader className={showForm ? "bg-success" : "bg-info"}>
          <h5><FaCashRegister className="mb-2 mr-1" />&nbsp;Saldo</h5>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol xs="12" sm="6" className={centeredItem}>
              <Balance />
            </CCol>
            <CCol xs="12" sm="6" className={centeredItem}>
              <BuyBtn />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default AccountBalance;
