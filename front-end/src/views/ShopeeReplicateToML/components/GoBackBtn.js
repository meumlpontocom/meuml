import React, { useCallback, useContext }   from "react";
import Button                               from "./Button";
import classnames                           from "classnames";
import { CCol }                             from "@coreui/react";
import { FaArrowCircleLeft, FaTimesCircle } from "react-icons/fa";
import { useHistory }                       from "react-router-dom";
import useIsXsDisplay                       from "../hooks/useIsXsDisplay";
import shopeeReplicateToMLContext           from "../shopeeReplicateToMLContext";

const GoBackBtn = () => {
  const history        = useHistory();
  const isSmallDisplay = useIsXsDisplay();
  const {
    showAdvertPreview, setShowAdvertPreview,
  } = useContext(shopeeReplicateToMLContext);
  const handleGoBackClick = useCallback(() => {
    if (showAdvertPreview) setShowAdvertPreview(false); else history.goBack();
  }, [showAdvertPreview, history, setShowAdvertPreview]);
  const columnConfig = classnames(
    isSmallDisplay
      ? "d-flex justify-content-center mb-3"
      : "text-left",
  );
  return (
    <CCol xs={12} sm={6} className={columnConfig}>
      <Button
        size="lg"
        variant="outline"
        block={isSmallDisplay}
        onClick={handleGoBackClick}
        color={showAdvertPreview ? "warning" : "danger"}
      >
        {showAdvertPreview ? (<>
          <FaArrowCircleLeft className="mb-1 mr-2" />
          Voltar
        </>) : (<>
          <FaTimesCircle className="mb-1 mr-2" />
          Cancelar
        </>)}
      </Button>
    </CCol>
  );
};

export default GoBackBtn;
