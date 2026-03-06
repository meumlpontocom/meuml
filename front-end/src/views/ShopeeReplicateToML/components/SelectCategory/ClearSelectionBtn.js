import React, { useContext }      from "react";
import { CButton, CSpinner }      from "@coreui/react";
import { FaPlusCircle }           from "react-icons/fa";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const ClearSelectionBtn = () => {
  const {
    isLoadingCategoryAttributes, resetStates,
  } = useContext(shopeeReplicateToMLContext);
  return (
    <CButton
      color="primary"
      variant="outline"
      block
      size="lg"
      onClick={resetStates}
    >
      {isLoadingCategoryAttributes ? <CSpinner color="light" size="sm" /> :
        <FaPlusCircle className="mb-1" />}&nbsp;
      Limpar seleção
    </CButton>
  );
};

export default ClearSelectionBtn;
