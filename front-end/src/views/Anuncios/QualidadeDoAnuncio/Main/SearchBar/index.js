import React from "react";
import { Col, Row, Button, Input } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { saveFilterString } from "../../../../../redux/actions";

export default function SearchBar({ onSearch }) {
  const dispatch = useDispatch();
  const string = useSelector(state => state.advertsPositionGrid.filterString);
  const setFilterString = string => dispatch(saveFilterString(string));

  const clearBtn = () => {
    onSearch("");
    setFilterString("");
    document.querySelector("#searchInput").value = "";
  };

  return (
    <Col className="mb-3" sm="6" md="6" lg="6" xs="12">
      <Row>
        <Col className="mt-1" sm="8" md="8" lg="8" xs="12">
          <Input
            onChange={event => setFilterString(event.target.value)}
            placeholder="Buscar por TÍTULO ou ID"
            id="searchInput"
            name="searchInput"
          />
        </Col>
        <Col className="mt-1" sm="4" md="4" lg="4" xs="12">
          <Row style={{ justifyContent: "space-around" }}>
            <Button
              className="ml-2"
              color="primary"
              onClick={() => onSearch(string)}
            >
              <i className="cil-search mr-1" />
              Buscar
            </Button>
            <Button
              className="mr-2"
              color="secondary"
              onClick={() => clearBtn()}
              disabled={string === "" ? true : false}
            >
              <i className="cil-clear-all mr-1" />
              Limpar
            </Button>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
