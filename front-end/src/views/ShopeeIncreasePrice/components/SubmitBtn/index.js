import React, { useCallback } from "react";
import BtnIcon                from "./BtnIcon";
import PropTypes              from "prop-types";
import { CButton }            from "@coreui/react";
import useRequests            from "../../hooks/useRequests";

const SubmitBtn = ({ percentage, adverts }) => {
  const [postFormAndConfirmBeforeProcessing, isLoading] = useRequests({ percentage, adverts });
  const handleClick = useCallback(
    async () => await postFormAndConfirmBeforeProcessing({ confirmed: 0 })
  , [postFormAndConfirmBeforeProcessing]);
  return (
    <CButton 
      size="lg" 
      color="success" 
      variant="outline" 
      onClick={handleClick}
      disabled={isLoading || !percentage} 
    >
      <BtnIcon isLoading={isLoading} />&nbsp;Confirmar
    </CButton>
  )
}

SubmitBtn.propTypes = {
  adverts: PropTypes.object,
  percentage: PropTypes.number,
}

export default SubmitBtn;
