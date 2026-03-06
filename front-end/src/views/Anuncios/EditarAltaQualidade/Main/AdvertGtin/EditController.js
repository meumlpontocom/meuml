import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { highQualitySaveNewGtin } from "../../../../../redux/actions/_highQualityActions";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import Input from "reactstrap/lib/Input";
import Button from "reactstrap/lib/Button";

export default function EditController({ toggleController, edit }) {
  const dispatch = useDispatch();
  const [newGtin, setNewGtin] = useState("");
  const { attributes } = useSelector((state) => state.highQualityAdvert);

  const GTIN = useMemo(() => {
    const gtinAttribute = attributes
      ? attributes.filter((attribute) => attribute.id === "GTIN")
      : [];
    const GTIN = gtinAttribute.length ? gtinAttribute[0].value_name : null;
    return !GTIN ? "N / A" : GTIN;
  }, [attributes]);

  function handleChange({ target: { value } }) {
    setNewGtin(value);
  }

  function saveNewTitle() {
    toggleController();
    dispatch(highQualitySaveNewGtin(newGtin));
  }

  return edit ? (
    <Row>
      <Col className="col-xs-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
        <Input type="text" value={newGtin} onChange={handleChange} />
      </Col>
      <Col className="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
        <Button color="success" onClick={saveNewTitle}>
          <i className="cil-check mr-1" />
          Salvar
        </Button>
      </Col>
    </Row>
  ) : (
    <p className="text-muted ml-1 mt-3">{GTIN}</p>
  );
}
