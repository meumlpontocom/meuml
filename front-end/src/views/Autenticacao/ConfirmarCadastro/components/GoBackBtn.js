import React from "react";
import { useHistory } from "react-router";
import ButtonComponent from "src/components/ButtonComponent";

const GoBackBtn = () => {
  const history = useHistory();
  return (
    <ButtonComponent
      title="Voltar"
      icon="cil-arrow-left"
      onClick={() => history.goBack()}
      height={40}
      color="dark"
    />
  );
};

export default GoBackBtn;
