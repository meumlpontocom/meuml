import React, { useState } from "react";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import EditController from "./EditController";

export default function AdvertDescription() {
  const [editDescription, setEditDescription] = useState(false);

  function toggleEditAdvertDescription() {
    setEditDescription(!editDescription);
  }
  return (
    <Col className="mb-3" xs="12">
      <p className={editDescription ? "border-danger" : "border-bottom"}>
        <span className="float-left h5">Descrição:</span>
        <Button
          color={editDescription ? "danger" : "secondary"}
          className="float-right"
          size="sm"
          onClick={toggleEditAdvertDescription}
        >
          <i className={`cil-${editDescription ? "x" : "pencil"} mr-1`} />
          {editDescription ? "Fechar" : "Editar"}
        </Button>
      </p>
      <EditController toggleDataInput={toggleEditAdvertDescription} edit={editDescription} />
    </Col>
  );
}
