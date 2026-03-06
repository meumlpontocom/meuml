import React from "react";
import Button from "reactstrap/lib/Button";

export default function CancelEdition({ history }) {
  function handleClick() {
    history.goBack();
  }
  return (
    <Button onClick={handleClick}>
      <i className="cil-arrow-left mr-1" />
      Voltar
    </Button>
  );
}
