import React from "react";
import PropTypes from "prop-types";
import { CButton, CCallout, CCol, CRow } from "@coreui/react";

function TrackShipment({ shipments }) {
  return (
    <>
      {shipments.map((shipment) => {
        const {
          carrier_url,
          carrier_name,
          tracking_method,
          tracking_number,
          status,
          substatus,
          shipping_name,
          history,
        } = shipment;
        const lastUpdate = history[history.length - 1].date;
        return (
          <CRow className="h-100 d-flex justify-content-center">
            <CCol className="text-left" xs="12" style={{ padding: "30px" }}>
              <CCallout color="danger">
                <h4 className="text-warning">
                  <strong>
                    {carrier_name} ({tracking_method})
                  </strong>
                </h4>
                <h5>{shipping_name}</h5>
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  <li>
                    <p>
                      <strong>Status:</strong>&nbsp;{status}
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Substatus:</strong>&nbsp;{substatus}
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong>Código de rastreio:</strong>&nbsp;
                      {tracking_number || "Não há"}
                    </p>
                  </li>
                </ul>
                <CRow
                  className="d-flex justify-content-between"
                  style={{ padding: "0px 16px" }}
                >
                  <small className="text-muted align-self-center">
                    Última atualização:&nbsp;
                    {lastUpdate
                      ? new Date(lastUpdate).toLocaleDateString("pt-BR")
                      : "Não há"}
                  </small>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => window.open(carrier_url, "_blank")}
                  >
                    <i className="cil-paper-plane mr-1" />
                    Abrir link
                  </CButton>
                </CRow>
              </CCallout>
            </CCol>
          </CRow>
        );
      })}
    </>
  );
}

TrackShipment.propTypes = {
  shipments: PropTypes.array.isRequired,
};

export default TrackShipment;
