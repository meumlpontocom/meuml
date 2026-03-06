import React, { useState, useEffect } from "react";
import FreeSubs from "./FreeSubs";
import api from "../../../services/api";
import ProfessionalSubs from "./ProfessionalSubs";
import { getToken } from "../../../services/auth";
import { Col, Card, CardBody, Row, CardHeader } from "reactstrap";
import LoadingCardData from "../../../components/LoadingCardData";
import CustomSubs from "./CustomSubs";

export default function MySubscriptions() {
  const [loading, setLoading] = useState(true);
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
      await fetchSubscriptionDetails().then((response) => {
        const data = handleSubscriptionDetailsData(response);
        setSubscriptionDetails({ ...data });
      });
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    handleFetch();
  }, []);
  return (
    <>
      <Col
        className="animated fadeIn"
        style={{ padding: "0 0 0" }}
        xs={12}
        sm={12}
        md={6}
        lg={6}
      >
        <Card className="card-accent-info">
          <CardHeader style={{ color: "#20a8d8", fontWeight: "bold" }}>
            <span>
              {"Minhas assinaturas".toUpperCase()}
              <i className="cil-pencil ml-1" />
            </span>
          </CardHeader>
          <CardBody style={{ marginTop: "-25px" }}>
            {loading ? (
              <LoadingCardData />
            ) : (
              <Row>
                <Col xs={12} sm={12} lg={12} md={12}>
                  <FreeSubs accounts={subscriptionDetails.free} />
                </Col>
                <Col xs={12} sm={12} lg={12} md={12}>
                  <ProfessionalSubs
                    accounts={subscriptionDetails.professional}
                  />
                </Col>
                <Col xs={12} sm={12} lg={12} md={12}>
                  <CustomSubs accounts={subscriptionDetails.custom} />
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
      </Col>
    </>
  );
}
