import React, { useState } from "react";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import Input from "reactstrap/lib/Input";
import Button from "reactstrap/lib/Button";
import { useSelector, useDispatch } from "react-redux";
import { highQualitySaveNewTitle } from "../../../../../redux/actions/_highQualityActions";

export default function EditController({ toggleDataInput, edit }) {
  const dispatch = useDispatch();
  const {
    advertData: { ...advert },
  } = useSelector((state) => state.highQualityAdvert);
  const [newTitle, setNewTitle] = useState("");

  function handleChange({ target: { value } }) {
    setNewTitle(value);
  }

  function saveNewTitle() {
    toggleDataInput();
    dispatch(highQualitySaveNewTitle(newTitle));
  }
  return edit ? (
    <Row>
      <Col className="col-xs-12 col-sm-12 col-md-8 col-lg-8 col-xl-8">
        <Input type="text" value={newTitle} onChange={handleChange} />
      </Col>
      <Col className="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
        <Button color="success" onClick={saveNewTitle}>
          <i className="cil-check mr-1" />
          Salvar
        </Button>
      </Col>
    </Row>
  ) : (
    <p className="text-muted ml-1 mt-3">{advert?.title}</p>
  );
}
