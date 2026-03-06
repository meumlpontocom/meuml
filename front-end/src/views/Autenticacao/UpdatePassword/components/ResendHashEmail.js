import React, { useCallback, useContext } from "react"
import { CButton }                        from "@coreui/react";
import updatePasswordContext              from "../updatePasswordContext";
import useResendHashAlerts                from "../hooks/useResendHashAlerts";
import useSubmitEmailRequest              from "../../PasswordRecovery/hooks/useSubmitEmailRequest";

const ResendHashEmail = () => {
  const { hash }                          = useContext(updatePasswordContext);
  const [sendConfirmationEmail, isLoading] = useSubmitEmailRequest(updatePasswordContext);
  const { checkSpamAndTrashInboxesAlert, confirmResendingHashEmailAlert } = useResendHashAlerts();

  const handleClick = useCallback(async () => {
    const hashEmailNotFound = await checkSpamAndTrashInboxesAlert();
    if (hashEmailNotFound) {
      const resendHashEmail = await confirmResendingHashEmailAlert();
      if (resendHashEmail && !isLoading) sendConfirmationEmail();
    }
  }, [checkSpamAndTrashInboxesAlert, confirmResendingHashEmailAlert, isLoading, sendConfirmationEmail]);

  return hash ? (
    <></>
  ) : (
    <div className="text-right">
      <CButton color="link" disabled={isLoading} onClick={handleClick}>
        <small>Não recebi o código</small>
      </CButton>
    </div>
  );
}

export default ResendHashEmail