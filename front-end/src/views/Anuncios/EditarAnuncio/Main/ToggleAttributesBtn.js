import React from "react";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import { useDispatch, useSelector } from "react-redux";
import { setToggleAttributes } from "../../../../redux/actions/_editAdvertActions";

function ToggleAttributesBtn() {
  const dispatch = useDispatch();
  const {
    toggleAttributes,
    advertData: { attributes },
  } = useSelector(({ editAdvert }) => editAdvert);
  function handleClick() {
    dispatch(setToggleAttributes());
  }
  return (
    <Col xs="12" className="text-center mb-3">
      <Button
        color="secondary"
        onClick={handleClick}
        disabled={!attributes?.length ? true : false}
      >
        <i className="cil-list-rich mr-1" />
        {toggleAttributes ? "Esconder Atributos" : "Editar atributos"}
      </Button>
    </Col>
  );
}

export default ToggleAttributesBtn;
