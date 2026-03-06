import React, { useContext, useState } from "react";
import { Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import context from "./contex";
export default function SearchAdvertByNameOrId({ id }) {
  const [searchId, setSearchId] = useState("");
  const { handleFetchApi } = useContext(context);
  return (
    <Row className="mb-3">
      <Col sm="6" md="6" lg="4" xs="10">
        <input
          type="text"
          placeholder="Procurar anúncio por nome ou ID"
          className="form-control"
          onChange={({ target: { value } }) => setSearchId(value)}
        />
      </Col>
      <Link
        className={`btn btn-primary btn-sm ${searchId === "" && "disabled"}`}
        onClick={() => handleFetchApi({ id: searchId })}
        to={{
          from: `/posicionamento/${id}`,
          pathname: `/posicionamento/${searchId}`,
        }}
      >
        <i className="cil-search mr-1" />
        Procurar
      </Link>
    </Row>
  );
}
