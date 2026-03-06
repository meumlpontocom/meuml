import React, { useCallback } from "react";
import { CButton }            from "@coreui/react";
import { FaTimesCircle }      from "react-icons/fa";
import { useHistory }         from "react-router-dom";

const CancelBtn = () => {
  const history     = useHistory();
  const handleClick = useCallback(() => history.goBack(), [history]);
  return (
    <CButton color="danger" variant="outline" size="lg" onClick={handleClick}>
      <FaTimesCircle />&nbsp;Cancelar
    </CButton>
  )
}

export default CancelBtn;
