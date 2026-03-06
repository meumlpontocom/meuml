import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import updatePasswordContext from "../updatePasswordContext";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const ConfirmPasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { password, confirmPassword, setConfirmPassword, passwordIsValid } =
    useContext(updatePasswordContext);

  const handleToogleShowPass = () => {
    setShowPassword(prevState => !prevState);
  };

  return String(password).length < 4 ? (
    <></>
  ) : (
    <CInputGroup className="fade-in">
      <CInputGroupPrepend>
        <CInputGroupText>
          <FaLock />
        </CInputGroupText>
      </CInputGroupPrepend>
      <CInput
        size="lg"
        type={showPassword ? "text" : "password"}
        id="confirm-password"
        name="confirm-password"
        placeholder="Confirme sua senha"
        value={confirmPassword}
        className={passwordIsValid}
        onChange={({ target: { value } }) => setConfirmPassword(value)}
      />
      <CInputGroupPrepend id="btn-showpass" onClick={handleToogleShowPass}>
        <CInputGroupText>{showPassword ? <FaEyeSlash /> : <FaEye />}</CInputGroupText>
      </CInputGroupPrepend>
    </CInputGroup>
  );
};

export default ConfirmPasswordInput;
