import React                                       from "react";
import { CCard, CSpinner, CCardFooter, CCardBody } from "@coreui/react";
import { Link }                                    from "react-router-dom";
import formatMoney                                 from "src/helpers/formatMoney";

const CreditsWidget = ({ isLoading, availableCredits }) => (
  <CCard>
    <CCardBody className="text-center p-2">
      <div className="text-muted text-uppercase font-weight-bold">Saldo de créditos</div>
      <div className="text-value-lg">
        {isLoading ? (
          <CSpinner size="sm" color="info" />
        ) : (
          formatMoney(!availableCredits ? 0 : availableCredits)
        )}
      </div>
    </CCardBody>
    <CCardFooter className="text-center p-2">
      <Link to="/creditos/comprar">Comprar mais</Link>
    </CCardFooter>
  </CCard>
);

export default CreditsWidget;
