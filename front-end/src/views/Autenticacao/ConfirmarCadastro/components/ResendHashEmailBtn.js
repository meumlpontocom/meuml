import React         from "react";
import { CButton }   from "@coreui/react";
import useResendHash from "../hooks/useResendHash";

const ResendHashEmailBtn = ({ email }) => {
  const { resendHashCodeEmail } = useResendHash();
  return (
    <div className="text-right">
      <CButton color="link" onClick={() => resendHashCodeEmail(email)}>
        <small>
          Não possuo um código
        </small>
      </CButton>
    </div>
  );
};

export default ResendHashEmailBtn;
