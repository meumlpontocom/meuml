import React, { useContext }                                        from "react";
import classNames                                                   from "classnames";
import { FaAt }                                                     from "react-icons/fa";
import passwordRecoveryContext                                      from "../passwordRecoveryContext";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const EmailInput = () => {
  const { setEmail, email, hasHash, isValidEmail } = useContext(passwordRecoveryContext);

  const isError = classNames(hasHash ? isValidEmail ? "is-valid" : "is-invalid" : "");

  const AskForEmail = () => isError.match("invalid") ? (
    <small className="text-danger">Informe seu e-mail para poder informar o código.</small>
  ) : <></>;

  return (
    <>
      <CInputGroup>
        <CInputGroupPrepend>
          <CInputGroupText>
            <FaAt />
          </CInputGroupText>
        </CInputGroupPrepend>
        <CInput
          size="lg"
          id="email"
          name="email"
          type="email"
          placeholder="Digite aqui seu email"
          value={email}
          className={isError}
          onChange={({ target: { value } }) => setEmail(value)}
        />
      </CInputGroup>
      <AskForEmail />
    </>
  );
};

export default EmailInput;
