import React from "react";
import { useHistory } from "react-router-dom";
import ButtonComponent from "src/components/ButtonComponent";

export default function GoBackBtn() {
  const history = useHistory();
  function handleClick() {
    history.goBack();
  }
  return (
    <ButtonComponent
      color="secondary"
      onClick={handleClick}
      icon="cil-arrow-left"
      title="Voltar"
      variant=""
    />
  );
}
