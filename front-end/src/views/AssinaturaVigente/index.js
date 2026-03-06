import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ScreenTitle from "./ScreenTitle";
import Subscriptions from "./Subscriptions";
import { Row, Col, Card, CardBody, CardHeader, CardFooter } from "reactstrap";
import { Redirect } from "react-router-dom";
import LoadPageHandler from "../../components/Loading";
import fetchSubscriptionDetails, {
  fetchModules,
} from "./fetchSubscriptionDetails";
import "./style.css";
import ModulesCatalogue from "./ModulesCatalogue";
export default function AssinaturaVigente() {
  const [subscription, setSubscription] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirectToSubscriptions, setRedirectToSubscriptions] = useState(false);
  const [modulesArray, setModulesArray] = useState([]);
  useEffect(() => {
    fetchSubscriptionDetails()
      .then((response) => {
        if (response.message !== "Assinatura") {
          Swal.fire({
            title: "Atenção",
            html: `<span>${response.message}</span>`,
            type: "info",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            showConfirmButton: true,
            confirmButtonText: "Ver assinaturas",
          }).then((choice) => {
            if (choice.dismiss) {
              Swal.close();
              return;
            }
            setRedirectToSubscriptions(true);
          });
        } else setSubscription(response.data);
      })
      .catch((error) => error)
      .finally(() => {
        fetchModules()
          .then((data) => {
            const modules = data.modules.map((module) => {
              return {
                id: module.id,
                title: module.title,
                description: module.tools,
                price: module.price,
              };
            });
            setModulesArray(modules);
          })
          .catch((error) => error)
          .finally(() => setLoading(false));
      });
  }, []);

  const HandleRedirect = () => {
    return !redirectToSubscriptions ? null : (
      <Redirect to="/assinaturas/planos" from="/assinaturas/plano-atual" />
    );
  };

  return (
    <>
      <HandleRedirect />
      <LoadPageHandler
        isLoading={loading}
        render={
          <Col xs={12}>
            <Card className="card-accent-primary">
              <CardHeader>
                <ScreenTitle />
              </CardHeader>
              <CardBody>
                <Row>
                  <Subscriptions
                    subscription={subscription}
                    modules={modulesArray}
                  />
                </Row>
              </CardBody>
              <CardFooter className="text-left align-items-start">
                <ModulesCatalogue modules={modulesArray} />
              </CardFooter>
            </Card>
          </Col>
        }
      />
    </>
  );
}
