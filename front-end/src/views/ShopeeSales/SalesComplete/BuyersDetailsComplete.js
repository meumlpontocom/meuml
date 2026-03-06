import React from "react";
import { useSelector } from "react-redux";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";

const BuyersDetailsComplete = ({ id }) => {
  const sales = useSelector(({ shopee }) => shopee.sales);
  const {
    sale: {
      buyer_first_name,
      buyer_last_name,
      buyer_nickname,
      buyer_id,
      buyer_phone_area,
      buyer_phone_number,
      buyer_doc_type,
      buyer_doc_number,
      buyer_points,
    },
  } = sales[id];

  return (
    <div className="buyer-details border border-dark rounded p-0 mt-2 mb-2 mb-lg-0">
      <div className="sales-header items-header d-flex justify-content-between p-2 ">
        <p className="mb-0 salescard-body-title">Comprador</p>
        {buyer_points ? (
          <div>
            <p className="mb-0 salescard-body-title">
              Pontuação:{" "}
              <span style={{ color: "#000", fontWeight: "normal" }}>
                {buyer_points}
              </span>
            </p>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="sales-body p-2">
        <Row>
          <Col xs="12" md="12" lg="12" xl="12">
            <div className="d-flex mr-auto">
              <p className="mb-0 salescard-body-title">Nome: </p>
              <p className="mb-0 ml-2">
                {buyer_first_name} {buyer_last_name}
              </p>
            </div>
          </Col>
          <Col xs="12" md="12" lg="12" xl="12">
            <div className="d-flex mr-auto">
              <p className="mb-0 salescard-body-title">Apelido: </p>
              <p className="mb-0 ml-2 text-overflow-auto">{buyer_nickname}</p>
            </div>
          </Col>
          {buyer_doc_number && (
            <Col xs="12" md="6" lg="12" xl="6">
              <div className="d-flex mr-auto">
                <p className="mb-0 salescard-body-title">{buyer_doc_type}: </p>
                <p className="mb-0 ml-2">{buyer_doc_number}</p>
              </div>
            </Col>
          )}
          {buyer_phone_number && (
            <Col xs="12" md="6" lg="12" xl="6">
              <div className="d-flex mr-auto">
                <p className="mb-0 salescard-body-title">Telefone: </p>
                <p className="mb-0 ml-2">
                  (${buyer_phone_area ? buyer_phone_area : "-"}){" "}
                  {buyer_phone_number}
                </p>
              </div>
            </Col>
          )}
          <Col xs="12" md="6" lg="12" xl="6">
            <div className="d-flex mr-auto">
              <p className="mb-0 salescard-body-title">ID: </p>
              <p className="mb-0 ml-2">{buyer_id}</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BuyersDetailsComplete;
