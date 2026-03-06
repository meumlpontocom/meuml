import React from "react";
import { useSelector } from "react-redux";
import { CButton } from "@coreui/react";
import { FaTimesCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const CancelButton = () => {
  const history = useHistory();
  const isLoading = useSelector(state => state.advertsReplication.isLoading);
  return (
    <CButton
      size="lg"
      disabled={isLoading}
      color="danger"
      variant="outline"
      onClick={() => history.goBack()}
      style={{ float: "left" }}
    >
      <FaTimesCircle />
      &nbsp; Cancelar
    </CButton>
  );
};

export default CancelButton;
