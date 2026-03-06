import React, { useState, useEffect } from "react";
import { CCol, CCard, CCardBody, CRow, CCardHeader } from "@coreui/react";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import FreePlanAccounts from "./FreePlanAccounts";
import ProPlanAccounts from "./ProPlanAccounts";
import CustomPlanAccounts from "./CustomPlanAccounts";
import LoadingCardData from "src/components/LoadingCardData";

const CurrentSubscriptionsCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    professional: [],
    free: [],
  });
  async function fetchSubscriptionDetails() {
    try {
      const {
        data: { data },
      } = await api.get(`/subscriptions/details`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return data;
    } catch (error) {
      if (error.response) {
        return error.resopnse;
      }
      return error;
    }
  }
  function handleSubscriptionDetailsData(data) {
    let freeSubs = [];
    let professionalSubs = [];
    let customSubs = [];
    let unknownSubs = [];
    for (const account in data) {
      switch (data[account].package_name) {
        case "Profissional":
          professionalSubs.push(data[account]);
          break;
        case "Personalizado":
          customSubs.push(data[account]);
          break;
        case "Gratuito":
          freeSubs.push(data[account]);
          break;
        default:
          unknownSubs.push(data[account]);
          break;
      }
    }
    return {
      free: [...freeSubs],
      professional: [...professionalSubs],
      custom: [...customSubs],
    };
  }
  async function handleFetch() {
    try {
      await fetchSubscriptionDetails().then(response => {
        const data = handleSubscriptionDetailsData(response);
        setSubscriptionDetails({ ...data });
      });
    } catch (error) {
      return error;
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    handleFetch();
  }, []); //eslint-disable-line
  return (
    <CCard>
      <CCardHeader className="bg-gradient-dark text-white text-center">
        <h5 className="mb-0">Minhas assinaturas</h5>
      </CCardHeader>
      <CCardBody>
        {isLoading ? (
          <LoadingCardData color="#3c4b64" />
        ) : (
          <CRow>
            <CCol xs={12} sm={12} lg={12} md={12}>
              <FreePlanAccounts accounts={subscriptionDetails.free} />
            </CCol>
            <CCol xs={12} sm={12} lg={12} md={12}>
              <ProPlanAccounts accounts={subscriptionDetails.professional} />
            </CCol>
            <CCol xs={12} sm={12} lg={12} md={12}>
              <CustomPlanAccounts accounts={subscriptionDetails.custom} />
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  );
};

export default CurrentSubscriptionsCard;
