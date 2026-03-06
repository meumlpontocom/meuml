import React, { useCallback, useContext, useMemo } from "react";
import { CButton, CSpinner }                       from "@coreui/react";
import { FaCheckCircle }                           from "react-icons/fa";
import updatePasswordContext                       from "../updatePasswordContext";
import useUpdatePassword                           from "../hooks/useUpdatePassword";

const SubmitBtn = () => {
  const [updatePassword, isLoading]      = useUpdatePassword();
  const { hashIsValid, passwordIsValid } = useContext(updatePasswordContext);

  const disableBtn = useMemo(() => !(!!hashIsValid && !!passwordIsValid), [hashIsValid, passwordIsValid]);

  const handleClick = useCallback(() => {
    updatePassword();
  }, [updatePassword]);

  return (
    <CButton block size="lg" color="outline-success" disabled={disableBtn} onClick={handleClick}>
      {isLoading ? <CSpinner color="success" size="sm" /> : <FaCheckCircle />}
      &nbsp;Alterar senha
    </CButton>
  );
};

export default SubmitBtn;
