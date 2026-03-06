import React, { useCallback, useContext } from "react";
import { CButton, CSpinner }              from "@coreui/react";
import { FaPaperPlane, FaQuestionCircle } from "react-icons/fa";
import { useHistory }                     from "react-router-dom";
import passwordRecoveryContext            from "../passwordRecoveryContext";
import useSubmitEmailRequest              from "../hooks/useSubmitEmailRequest";

const SubmitBtn = () => {
  const history                           = useHistory();
  const [sendConfirmationEmail, isLoading] = useSubmitEmailRequest(passwordRecoveryContext);
  const { isValidEmail, hasHash, email }  = useContext(passwordRecoveryContext);

  const handleClick = useCallback(() => {
    if (!hasHash && isValidEmail)
      sendConfirmationEmail();
    else
      history.push(`/recuperar-senha/${email}`);
  }, [email, hasHash, history, isValidEmail, sendConfirmationEmail]);

  return (
    <CButton 
      block 
      size="lg" 
      color={`outline-${hasHash ? "primary" : "success"}`} 
      onClick={handleClick}
      disabled={!isValidEmail || isLoading} 
    >
      {isLoading ? <CSpinner color="success" size="sm" /> : hasHash ? <FaQuestionCircle /> : <FaPaperPlane />}
      &nbsp;{hasHash ? "Informar código" : "Recuperar senha"}
    </CButton>
  );
};

export default SubmitBtn;
