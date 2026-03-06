import React, { useCallback, useContext } from "react";
import { FaAsterisk, FaPaste }            from "react-icons/fa";
import ResendHashEmail                    from "./ResendHashEmail";
import updatePasswordContext              from "../updatePasswordContext";
import getFromClipboard                   from "src/helpers/getFromClipboard";
import { 
  CInput, 
  CInputGroup, 
  CInputGroupAppend, 
  CInputGroupPrepend, 
  CInputGroupText 
}                                         from "@coreui/react";

const HashInput = () => {
  const { hash, setHash, hashIsValid } = useContext(updatePasswordContext);
  const handlePasteClick = useCallback(
    () => getFromClipboard({ toastError: true, callback: setHash }),
    [setHash],
  );
  return (
    <>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaAsterisk />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          size="lg"
          id="hash"
          name="hash"
          type="text"
          placeholder="Código enviado no e-mail"
          value={hash}
          className={hashIsValid}
          onChange={({ target: { value } }) => setHash(value)}
        />
        <CInputGroupAppend className="pointer" onClick={handlePasteClick}>
          <CInputGroupText>
            <FaPaste />
          </CInputGroupText>
        </CInputGroupAppend>
      </CInputGroup>
      <ResendHashEmail />
    </>
  );
};

export default HashInput;
