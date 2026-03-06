import React from "react";
import PropTypes from "prop-types";
import { CCol as Col, CRow as Row, CButton as Button } from "@coreui/react";

function SelectDocumentType({ selectDocumentType }) {
  return (
    <Row className="text-center mt-5 fadeIn">
      <Col xs="12">
        <h2 className="mb-5">Qual a modalidade da nota?</h2>
      </Col>
      <Col xs="12" sm="6" md="6">
        <Button
          style={{ minWidth: "115px" }}
          color="primary"
          onClick={() => selectDocumentType("cpf")}
        >
          <i className="cil-user mr-1" />
          CPF
        </Button>
      </Col>
      <Col xs="12" sm="6" md="6">
        <Button
          style={{ minWidth: "115px" }}
          color="primary"
          onClick={() => selectDocumentType("cnpj")}
        >
          <i className="cil-industry mr-1" />
          CNPJ
        </Button>
      </Col>
    </Row>
  );
}

SelectDocumentType.propTypes = {
  selectDocumentType: PropTypes.func,
};

export default SelectDocumentType;
