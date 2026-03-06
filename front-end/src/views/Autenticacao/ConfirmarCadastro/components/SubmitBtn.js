import React from "react";
import ButtonComponent from "src/components/ButtonComponent";

const SubmitBtn = ({ handleSubmit, hash, email }) => {
  return (
    <ButtonComponent
      title="Confirmar"
      disabled={!hash}
      onClick={() => handleSubmit({ email, hash })}
      icon="cil-check"
      color="success"
      width="100%"
      height={40}
      variant=""
    />
  );
};

export default SubmitBtn;
