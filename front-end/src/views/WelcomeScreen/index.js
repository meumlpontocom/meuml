import { CCard, CCardHeader, CCol, CRow } from "@coreui/react";
import LoadPageHandler from "src/components/Loading";
import { AccountsList, CreditsWidget, RightSideCardsStyles } from "./components";
import useDashboardSummary from "./useDashboardSummary";
import { AppMeuMLCard } from "./components/AppMeuMLCard";
import { AnalyticalDashboardCard } from "./components/AnalyticalDashboardCard";
import { MainHeadingCard } from "./components/MainHeadingCard";
import { LogistikoPresentationCard } from "./components/LogistikoPresentationCard";
import UserProductWarning from "src/components/UserProductWarning";

const WelcomeScreen = () => {
  const { isLoading, dashboardSummary } = useDashboardSummary();

  return (
    <LoadPageHandler
      isLoading={!dashboardSummary || isLoading}
      render={
        <>
          <CRow>
            <CCol>
              <CCard>
                <CCardHeader className="bg-primary text-white">
                  <MainHeadingCard dashboardSummary={dashboardSummary} />
                </CCardHeader>
              </CCard>
              <UserProductWarning />
              <CRow>
                <CCol xl="12">
                  <LogistikoPresentationCard />
                </CCol>
                <CCol xl="7">
                  <AccountsList accounts={dashboardSummary?.subscriptions} />
                </CCol>
                <CCol xl="5">
                  <RightSideCardsStyles>
                    <CCol xs={12}>
                      <CreditsWidget
                        isLoading={isLoading}
                        availableCredits={dashboardSummary?.credits && dashboardSummary?.credits.amount}
                      />
                    </CCol>
                    <CCol xs={12}>
                      <AnalyticalDashboardCard />
                    </CCol>
                    <CCol xs={12}>
                      <AppMeuMLCard />
                    </CCol>
                  </RightSideCardsStyles>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </>
      }
    />
  );
};

export default WelcomeScreen;
