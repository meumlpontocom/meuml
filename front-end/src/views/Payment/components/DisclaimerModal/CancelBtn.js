import { CButton }                          from "@coreui/react";
import { FaTimesCircle, FaArrowCircleLeft } from "react-icons/fa";

function CancelBtn({ step, handleClick }) {
  return (
    <CButton size="lg" color="secondary" onClick={() => handleClick(step - 1)}>
      {step === 0 ? (
        <FaTimesCircle className="mb-1" />
      ) : (
        <FaArrowCircleLeft className="mb-1" />
      )}
      &nbsp;
      {step === 0 ? "Cancelar" : "Voltar"}
    </CButton>
  );
}

export default CancelBtn;
