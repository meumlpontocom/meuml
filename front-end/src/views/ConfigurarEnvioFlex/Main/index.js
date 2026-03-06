import React, { useState, useEffect, useContext } from "react";
import LoadPageHandler from "../../../components/Loading";
import fetchFlexConfig from "./fetchFlexConfig";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import Header from "./Header";
import Footer from "./Footer";
import Body from "./Body";

import { FlexConfigContext } from "../FlexConfigContext";

export default function Main() {
  const { setCurrentFlexConfig } = useContext(FlexConfigContext);

  const [loading, setLoading] = useState(true);

  const accountId = window.location.href.split("/#/configurar-envio-flex/")[1];

  useEffect(() => {
    fetchFlexConfig({ accountId, setLoading, setCurrentFlexConfig });
  }, [accountId, setCurrentFlexConfig]);

  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <Col>
          <Header />
          <Card className="card-accent-primary animated fadeIn">
            <Body />
            <Footer accountId={accountId} />
          </Card>
        </Col>
      }
    />
  );
}
