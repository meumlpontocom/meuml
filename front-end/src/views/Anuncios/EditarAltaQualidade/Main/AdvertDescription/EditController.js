import React, { useState } from "react";
import Col from "reactstrap/lib/Col";
import Row from "reactstrap/lib/Row";
import Input from "reactstrap/lib/Input";
import Button from "reactstrap/lib/Button";
import { useSelector, useDispatch } from "react-redux";
import { highQualitySaveNewDescription } from "../../../../../redux/actions/_highQualityActions";

export default function EditController({ toggleDataInput, edit }) {
  const dispatch = useDispatch();
  const {
    advertData: { ...advert },
  } = useSelector((state) => state.highQualityAdvert);
  const [newDescription, setNewDescription] = useState("");

  function handleChange({ target: { value } }) {
    setNewDescription(value);
  }

  function saveNewDescription() {
    toggleDataInput();
    dispatch(highQualitySaveNewDescription(newDescription));
  }

  return edit ? (
    <Row>
      <Col className="col-xs-12 col-sm-12 col-md-8 col-lg-9 col-xl-9">
        <Input
          type="textarea"
          value={newDescription}
          onChange={handleChange}
        />
      </Col>
      <Col className="col-xs-12 col-sm-12 col-md-4 col-lg-3 col-xl-3">
        <Button color="success" onClick={saveNewDescription}>
          <i className="cil-check mr-1" />
          Salvar
        </Button>
      </Col>
    </Row>
  ) : (
    <p className="text-muted ml-1 mt-3">
      {newDescription || advert?.description?.plain_text}
    </p>
  );
}
