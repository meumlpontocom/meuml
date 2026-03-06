import React, { useContext, useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import updatePasswordContext from "../updatePasswordContext";
import { CInput, CInputGroup, CInputGroupPrepend, CInputGroupText } from "@coreui/react";

const PasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { hashIsValid, password, setPassword, passwordIsValid } = useContext(updatePasswordContext);

  const handleToogleShowPass = () => {
    setShowPassword(prevState => !prevState);
  };

  return hashIsValid !== "is-valid" ? (
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
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        placeholder="Digite sua senha"
        value={password}
        className={passwordIsValid}
        onChange={({ target: { value } }) => setPassword(value)}
      />
      <CInputGroupPrepend id="btn-showpass" onClick={handleToogleShowPass}>
        <CInputGroupText>{showPassword ? <FaEyeSlash /> : <FaEye />}</CInputGroupText>
      </CInputGroupPrepend>
    </CInputGroup>
  );
};

export default PasswordInput;
