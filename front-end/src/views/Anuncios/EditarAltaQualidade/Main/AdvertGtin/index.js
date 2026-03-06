import React, { useState } from "react";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import EditController from "./EditController";

export default function AdvertGtin() {
  const [editGtin, setEditGtin] = useState(false);
  function toggleEditAdvertGtin() {
    setEditGtin(!editGtin);
  }
  return (
    <Col xs="12 mb-3">
      <p className={editGtin ? "border-danger" : "border-bottom"}>
        <span className="float-left h5">GTIN / EAN ou similar:</span>
        <Button
          color={editGtin ? "danger" : "secondary"}
          className="float-right"
          size="sm"
          onClick={toggleEditAdvertGtin}
        >
          <i className={`cil-${editGtin ? "x" : "pencil"} mr-1`} />
          {editGtin ? "Fechar" : "Editar"}
        </Button>
      </p>
      <EditController toggleController={toggleEditAdvertGtin} edit={editGtin} />
    </Col>
  );
}
