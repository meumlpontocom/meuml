import React, { useCallback } from "react";
import { CButton }            from "@coreui/react";
import { FaArrowCircleLeft }  from "react-icons/fa";
import { useHistory }         from "react-router-dom";

const GoBackBtn = () => {
  const history = useHistory();

  const handleClick = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <CButton block size="lg" color="outline-secondary" className="mt-3" onClick={handleClick}>
      <FaArrowCircleLeft />&nbsp;Voltar
    </CButton>
  );
};

export default GoBackBtn;
