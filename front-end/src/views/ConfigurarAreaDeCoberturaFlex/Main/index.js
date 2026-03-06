import React, { useState, useEffect, useMemo } from "react";
import Map from "./Map";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import Card from "reactstrap/lib/Card";
import Button from "reactstrap/lib/Button";
import CardBody from "reactstrap/lib/CardBody";
import CardFooter from "reactstrap/lib/CardFooter";
import { useDispatch, useSelector } from "react-redux";
import CoverageZoneList from "./CoverageZoneList";
import fetchCoverageZones from "./fetchCoverageZones";
import LoadPageHandler from "../../../components/Loading";
import { saveFlexShippingCoverageZone } from "../../../redux/actions";
import { useHistory } from "react-router-dom";
import putExpandCoverageZones from "./putExpandCoverageZones";
import PageHeader from "src/components/PageHeader";
import styled from "styled-components";

export default function Main() {
  const history = useHistory();
  const dispatch = useDispatch();
  const accountId = window.location.href.split(
    "/#/configurar-area-de-cobertura-flex/"
  )[1];
  const accountName = useSelector(
    (state) => state.accounts.accounts[accountId]?.external_name
  );
  const coverageZones = useSelector((state) =>
    Object.values(state.flexShippingConfig.converageZoneConfig)
  );
  const [loading, setLoading] = useState(true);
  const zones = useMemo(() => {
    if (coverageZones[0].polygon) {
      let coordinatesArray = [];
      for (const zone of coverageZones) {
        const {
          id,
          is_mandatory,
          label,
          price,
          selected,
          polygon: {
            geometry: { coordinates },
          },
        } = zone;
        if (selected) {
          let coordinatesList = [];
          for (const array of coordinates[0]) {
            coordinatesList.push({ lng: array[0], lat: array[1] });
          }
          coordinatesArray.push({
            id,
            is_mandatory,
            label,
            price,
            coordinates: coordinatesList,
          });
        }
      }
      if (coordinatesArray.length) return coordinatesArray;
    }
    return [];
  }, [coverageZones]);

  useEffect(() => {
    fetchCoverageZones({
      setLoading,
      accountId,
      dispatch,
      saveFlexShippingCoverageZone,
    });
  }, [dispatch, accountId]);

  const updateFlexConfig = () => {
    setLoading(true);
    putExpandCoverageZones({
      accountId,
      setLoading,
      selectedZones: zones.map((zone) => zone.id),
    });
  };

  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <>
          <Col>
            <PageHeader
              heading="Configurar Área de Cobertura Flex na Conta"
              subheading={accountName && accountName}
            />
            <Card className="card-accent-primary">
              <CardBody>
                <Row>
                  <CoverageZoneList col={{ xs: 12, sm: 4, md: 4, lg: 4 }} />
                  <Map zones={zones} col={{ xs: 12, sm: 8, md: 8, lg: 8 }} />
                </Row>
              </CardBody>
              <CardFooter>
                <Row className="d-flex justify-content-end p-1">
                  <StyledButton
                    color="secondary"
                    onClick={() => history.push("/contas")}
                  >
                    Cancelar
                  </StyledButton>

                  <StyledButton
                    onClick={() => updateFlexConfig()}
                    color="primary"
                  >
                    Salvar
                  </StyledButton>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </>
      }
    />
  );
}

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  min-height: 33px;
  margin-right: 10px;

  a {
    text-decoration: none;
    color: inherit;
  }
`;
