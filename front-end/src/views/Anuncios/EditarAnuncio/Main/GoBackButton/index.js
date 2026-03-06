import React from "react";
import Button from "reactstrap/lib/Button";
import { useDispatch } from "react-redux";
import { resetStore } from "../../../../../redux/actions/_editAdvertActions";

export default function GoBackButton({ history }) {
  const dispatch = useDispatch();

  function handleClick() {
    history.goBack();
    dispatch(resetStore());
  }

  return (
    <Button color="secondary" className="mr-auto" onClick={handleClick}>
      <i className="cil-chevron-left mr-1" />
      Voltar
    </Button>
  );
}
