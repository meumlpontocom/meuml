import React, { useContext, useState } from "react";
import { Row, Col } from "reactstrap";
import context from "./contex";
import { Button } from "reactstrap";
import Swal from "sweetalert2";

const SearchAdByDate = ({ id }) => {
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();
  const { handleFetchApi } = useContext(context);

  const handleDateChange = (event) => {
    const from = new Date(Date.parse(dateFrom.replace(/-/g, "/")));
    const to = new Date(Date.parse(dateTo.replace(/-/g, "/")));
    if (to < from) {
      event.preventDefault();
      Swal.fire({
        title: "Atenção",
        html: "<p>Data de início maior que data final</p>",
        type: "warning",
        showCloseButton: true,
      });
    } else if ((to.getTime() - from.getTime()) / (1000 * 3600 * 24) > 30) {
      event.preventDefault();
      Swal.fire({
        title: "Atenção",
        html: "<p>Período máximo de 30 dias</p>",
        type: "warning",
        showCloseButton: true,
      });
    } else {
      return handleFetchApi({ id, dateFrom, dateTo });
    }
  };

  const handleDateFrom = (event) => setDateFrom(event.target.value);
  const handleDateTo = (event) => setDateTo(event.target.value);

  return (
    <>
      <Row className="mb-1">
        <Col xs="12">
          <h3>Pesquisar outro período*</h3>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm="4" md="4" lg="2" xs="12">
          <input
            type="date"
            name="date-from"
            placeholder="date placeholder"
            className="form-control mb-1"
            onChange={handleDateFrom}
          />
        </Col>
        <i className="cil-arrow-right pt-2 d-none d-md-block" />
        <Col sm="4" md="4" lg="2" xs="12" className="d-flex align-items-center">
          <input
            type="date"
            name="date-to"
            placeholder="date placeholder"
            className="form-control mb-1"
            onChange={handleDateTo}
          />
        </Col>
        <Col sm="3" md="3" lg="3" xs="4">
          <Button
            color="primary"
            size="sm"
            type="submit"
            onClick={(event) => handleDateChange(event)}
          >
            <i className="cil-search mr-1" />
            Procurar
          </Button>
        </Col>
        <Col xs="12" className="ml-1">
          <p>*período máximo de 30 dias</p>
        </Col>
      </Row>
    </>
  );
};

export default SearchAdByDate;
