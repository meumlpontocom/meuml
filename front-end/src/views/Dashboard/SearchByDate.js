import React, { useState } from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import ButtonGroup from "reactstrap/lib/ButtonGroup";
import UncontrolledTooltip from "reactstrap/lib/UncontrolledTooltip";
import UncontrolledCollapse from "reactstrap/lib/UncontrolledCollapse";
import { useDispatch } from "react-redux";
import setPeriod, { formatDate } from "./setPeriod";

const SearchByDate = () => {
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(
    formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))
  );
  const [toDate, setToDate] = useState(
    formatDate(new Date(new Date().setDate(new Date().getDate())))
  );

  return (
    <Row className="">
      <Col xs="12" sm="12" md="12" lg="12" xl="6" className="pr-0">
        <Row>
          <Col className="pr-0">
            <div className="mb-4 mb-xl-0">
              <p className="h6 mb-1">Períodos pré-definidos</p>

              <ButtonGroup className="mr-2 mb-2 mb-sm-0">
                <Button
                  color="primary"
                  className="active"
                  id="today"
                  onClick={() => setPeriod.today({ dispatch })}
                >
                  Hoje
                  <UncontrolledTooltip placement="bottom" target="today">
                    Dados de hoje
                  </UncontrolledTooltip>
                </Button>
                <Button
                  color="primary"
                  id="week"
                  onClick={() => setPeriod.week({ dispatch })}
                >
                  7 dias
                  <UncontrolledTooltip placement="bottom" target="week">
                    Última semana
                  </UncontrolledTooltip>
                </Button>
                <Button
                  color="primary"
                  id="quarter"
                  onClick={() => setPeriod.quarter({ dispatch })}
                >
                  15 dias
                  <UncontrolledTooltip placement="bottom" target="quarter">
                    Últimos 15 dias
                  </UncontrolledTooltip>
                </Button>
                <Button
                  color="primary"
                  id="month"
                  onClick={() => setPeriod.month({ dispatch })}
                >
                  Mês
                  <UncontrolledTooltip placement="bottom" target="month">
                    Este mês
                  </UncontrolledTooltip>
                </Button>
              </ButtonGroup>

              <Button color="outline-secondary" id="daterange">
                Período personalizado
              </Button>
            </div>
          </Col>
        </Row>
      </Col>
      <Col xs="12" sm="12" md="12" lg="12" xl="6">
        <UncontrolledCollapse toggler="#daterange">
          <Row>
            <Col xs="12" sm="4" md="4" lg="4" xl="4">
              <p className="h6 mb-1 ml-1">Data inicial</p>
              <input
                onChange={({ target: { value } }) => setFromDate(value)}
                type="date"
                name="defaultInitialDate-date"
                defaultValue={fromDate}
                className="form-control"
                id="fromDate"
              />
            </Col>
            <Col xs="12" sm="4" md="4" lg="4" xl="4" className="mt-2 mt-sm-0">
              <p className="h6 mb-1 ml-1">Data Final</p>
              <input
                onChange={({ target: { value } }) => setToDate(value)}
                type="date"
                name="defaultFinalDate-date"
                defaultValue={toDate}
                className="form-control"
                id="toDate"
              />
            </Col>
            <Col xs="12" sm="4" md="4" lg="4" xl="4">
              <div className="mt-2 mt-sm-0 d-flex align-items-end mb-0 h-100">
                <Button
                  color="primary"
                  onClick={() =>
                    setPeriod.fetchCustomPeriodData({
                      dispatch,
                      fromDate,
                      toDate,
                    })
                  }
                >
                  <i className="cil-search mr-1" />
                  Procurar
                </Button>
              </div>
            </Col>
          </Row>
        </UncontrolledCollapse>
      </Col>
    </Row>
  );
};

export default SearchByDate;
