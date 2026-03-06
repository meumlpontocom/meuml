import React from "react";
import Button from "reactstrap/lib/Button";
import { useDispatch } from "react-redux";
import { resetForm } from "../../../../../redux/actions/_editAdvertActions";

const CleanEdit = () => {
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(resetForm());
  }

  return (
    <Button color="danger" onClick={handleClick} className="mr-0 mr-sm-2">
      <i className="cil-delete mr-1" />
      Limpar
    </Button>
  );
};

export default CleanEdit;
