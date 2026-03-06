import React, { useState } from "react";
import { Col, Card, CardBody, Row } from "reactstrap";
import { useDispatch } from "react-redux";
import { changeAdvertCatalog } from "../../../../../redux/actions";

export default function CatalogCandidates({ catalogCandidates, advertId }) {
  const dispatch = useDispatch();
  let [selected, setSelected] = useState(null);

  const handleCardClick = ({ candidate }) => {
    dispatch(
      changeAdvertCatalog({
        ...candidate,
        advertId,
      })
    );
    setSelected({ ...candidate });
  };

  const SelectedText = () => {
    return (
      <Row>
        <Col sm="12" md="12" lg="12" xs="12">
          <div
            className="mb-3"
            style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}
          >
            {selected !== null ? (
              <span id="selectedCandidate">Selecionado: {selected.name}</span>
            ) : (
              <span id="selectedCandidate">Nenhum selecionado.</span>
            )}
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div id="catalogCategoryPopup">
      {catalogCandidates.length > 0 && <SelectedText />}
      <div
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          maxHeight: "220px",
          textAlign: "center",
        }}
      >
        {catalogCandidates.length > 0 ? (
          catalogCandidates.map(({ domain_id, id, name, pictures }, index) => {
            return (
              <Col sm="12" md="12" lg="12" xs="12" key={index}>
                <Card
                  style={{ margin: "5px" }}
                  id={"catalogAlternativeNameOption" + index}
                  name="catalogAlternativeNameOption"
                  onClick={() => {
                    handleCardClick({
                      candidate: { domain_id, id, name, pictures },
                      index,
                    });
                  }}
                  className={
                    selected !== null
                      ? name === selected.name
                        ? "card-accent-primary"
                        : "card-accent-secondary"
                      : "card-accent-secondary"
                  }
                >
                  <CardBody>
                    <Row>
                      <Col style={{ paddingLeft: "0px" }}>
                        <img width="70" src={pictures} alt="Capa do anúncio" />
                        <h6 className="d-inline">
                          <strong>{name}</strong>
                        </h6>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            );
          })
        ) : (
          <h5>Nenhuma opção encontrada.</h5>
        )}
      </div>
    </div>
  );
}
