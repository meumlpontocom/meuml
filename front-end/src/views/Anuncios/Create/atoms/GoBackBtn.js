import React, { useContext }     from "react";
import { CButton }               from "@coreui/react";
import { FaArrowLeft }           from "react-icons/fa";
import { createMlAdvertContext } from "../createMlAdvertContext";

const GoBackBtn = () => {
  const { setShowAdvertAbstraction } = useContext(createMlAdvertContext);
  function handleGoBackClick() {
    setShowAdvertAbstraction(false);
  }
  return (
    <CButton size="lg" color="secondary" className="float-left" onClick={handleGoBackClick}>
      <FaArrowLeft className="mr-2" />
      Voltar
    </CButton>
  );
};

export default GoBackBtn;
