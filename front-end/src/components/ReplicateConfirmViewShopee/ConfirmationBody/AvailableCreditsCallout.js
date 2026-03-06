import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CCallout, CCol, CSpinner } from "@coreui/react";
import { saveAvailableCredits } from "src/redux/actions/_replicationActions";
import useAvailableCredits from "src/views/Creditos/hooks/useAvailableCredits";

const AvailableCreditsCallout = () => {
  const dispatch = useDispatch();
  const [isLoading, availableCredits, availableCreditsNumber] = useAvailableCredits();

  useEffect(() => {
    dispatch(saveAvailableCredits(availableCreditsNumber));
  }, [availableCreditsNumber, dispatch]);

  return (
    <CCol xs={12} sm={4}>
      <CCallout color="success">
        <small className="text-muted">Créditos disponíveis:</small>
        <br />
        <strong className="h4">{isLoading ? <CSpinner color="success" /> : availableCredits}</strong>
      </CCallout>
    </CCol>
  );
};

export default AvailableCreditsCallout;
