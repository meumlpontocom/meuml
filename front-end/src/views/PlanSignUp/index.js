import React from "react";
import { PlanSignUpProvider } from "./PlanSignUpContext";
import { CRow, CCol, CCard, CCardHeader, CCardBody } from "@coreui/react";
import PageHeader from "../../components/PageHeader";
import AccountsSelectors from "./AccountsSelectors";
import MySubscriptionsCard from "./MySubscriptionsCard";
import PlansAndModules from "./PlansAndModules";
import ErrorBoundary from "./ErrorBoundary";

const PlanSignUp = () => {
  return (
    <>
      <PlanSignUpProvider>
        <ErrorBoundary>
          <CRow>
            <CCol>
              <PageHeader heading="Assinar" />
            </CCol>
          </CRow>
          <CRow>
            <CCol lg="12" xl="6">
              <CCard>
                <CCardHeader className="bg-gradient-dark text-white text-center">
                  <h5 className="mb-0">Contas</h5>
                </CCardHeader>
                <CCardBody>
                  <AccountsSelectors />
                </CCardBody>
              </CCard>
            </CCol>
            <CCol lg="12" xl="6">
              <MySubscriptionsCard />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <PlansAndModules />
            </CCol>
          </CRow>
        </ErrorBoundary>
      </PlanSignUpProvider>
    </>
  );
};

export default PlanSignUp;
