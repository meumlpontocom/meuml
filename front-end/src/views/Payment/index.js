import { useReducer }                   from "react";
import { CCol, CContainer, CRow }       from "@coreui/react";
import { Provider }                     from "./paymentContext";
import paymentReducer, { initialState } from "./paymentReducer";
import PixModal                         from "./components/PixModal";
import PageHeader                       from "src/components/PageHeader";
import usePaymentCheckout               from "./hooks/usePaymentCheckout";
import PayerDataWidget                  from "./components/PayerDataWidget";
import DisclaimerModal                  from "./components/DisclaimerModal";
import TotalCoastWidget                 from "./components/TotalCoastWidget";
import PaymentReviewWidget              from "./components/PaymentReviewWidget";
import ErrorBoundary                    from "src/components/ErrorBoundary";

/**
 * Renders the payment view with a reducer provided by the paymentContext.
 *
 * @return {JSX.Element} The rendered payment view component.
 */
function Payment() {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  usePaymentCheckout(state, dispatch);
  return (
    <CContainer>
      <Provider value={{ state, dispatch }}>
        <PageHeader heading="Pagamento" />
        <PixModal />
        <CRow>
          <CCol xs={12} sm={6}>
            <ErrorBoundary >
              <TotalCoastWidget />
            </ErrorBoundary>
          </CCol>
          <CCol xs={12} sm={6}>
            <ErrorBoundary>
              <PayerDataWidget />
            </ErrorBoundary>
          </CCol>
          <CCol xs={12} sm={6}></CCol>
          <CCol xs={12} sm={6}>
            <ErrorBoundary>
              <PaymentReviewWidget />
            </ErrorBoundary>
          </CCol>
        </CRow>
        <DisclaimerModal />
      </Provider>
    </CContainer>
  );
}

export default Payment;
