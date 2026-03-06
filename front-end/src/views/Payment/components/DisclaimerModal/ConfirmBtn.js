import { CButton }                           from "@coreui/react";
import { FaCheckDouble, FaArrowCircleRight } from "react-icons/fa";

function ConfirmBtn({ step, content, handleClick }) {
  return (
    <CButton size="lg" color="secondary" onClick={() => handleClick(step + 1)}>
      {step === content.length - 1 ? "Concordar" : "Próximo"}
      &nbsp;
      {step === content.length - 1 ? (
        <FaCheckDouble />
      ) : (
        <FaArrowCircleRight className="mb-1" />
      )}
    </CButton>
  );
}

export default ConfirmBtn;
