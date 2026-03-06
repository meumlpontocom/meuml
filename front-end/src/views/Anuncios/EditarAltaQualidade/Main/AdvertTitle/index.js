import React, { useState } from "react";
import { useSelector } from "react-redux";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import EditController from "./EditController";

export default function AdvertTitle() {
  const {
    advertData: { isTitleEditable },
  } = useSelector((state) => state.highQualityAdvert);
  const [editTitle, setEditTitle] = useState(false);

  function toggleEditAdvertTitle() {
    setEditTitle(!editTitle);
  }

  return (
    <Col className="mb-3" xs="12">
      <p className={editTitle ? "border-danger" : "border-bottom"}>
        <span className="float-left h5">Titulo:</span>
        <Button
          disabled={!isTitleEditable}
          color={editTitle ? "danger" : "secondary"}
          className="float-right"
          size="sm"
          onClick={toggleEditAdvertTitle}
        >
          <i className={`cil-${editTitle ? "x" : "pencil"} mr-1`} />
          {editTitle ? "Fechar" : "Editar"}
        </Button>
      </p>
      <EditController toggleDataInput={toggleEditAdvertTitle} edit={editTitle} />
    </Col>
  );
}
