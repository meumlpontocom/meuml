import React, { useCallback, useContext } from "react";
import { CButton }                        from "@coreui/react";
import passwordRecoveryContext            from "../passwordRecoveryContext";

const InformHashBtn = () => {
  const { hasHash, setHasHash } = useContext(passwordRecoveryContext);

  const handleClick = useCallback(() => {
    setHasHash(p => !p);
  }, [setHasHash]);

  return (
    <CButton color="link" onClick={handleClick}>
      {hasHash ? "Não possui o código?" : "Já possui um código?"}
    </CButton>
  );
};

export default InformHashBtn;
