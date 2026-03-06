import React, { useState } from "react";
import {
  CCard,
  CCardBody,
  CCardFooter,
  CContainer,
  CCol,
  CRow,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
} from "@coreui/react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../../assets/img/brand/MeuML-logo2.png";
import api from "../../../services/api";
import validate from "./validateFormData";
import LoadPageHandler from "../../../components/Loading";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ButtonComponent from "src/components/ButtonComponent";

function Cadastro({ history }) {
  const [emailWarning, setEmailWarning] = useState(() => false);
  const [isLoading, setIsLoading] = useState(() => false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [form, setForm] = useState(() => ({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  }));

  const handleInputChange = ({ id, value }) => {
    if (id === "email") {
      emailCheck(value);
    }
    setForm(previous => {
      return {
        ...previous,
        [id]: value,
      };
    });
  };

  function emailCheck(email) {
    if (email.toLowerCase().match("icloud")) {
      setEmailWarning(true);
    }
  }

  async function handleSubmit() {
    try {
      const validation = validate({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (validation.status !== "success") {
        Swal.fire({
          title: "Atenção!",
          type: validation.status,
          html: `<p>${validation.message}</p>`,
          showCloseButton: true,
        }).then(() => setForm(state => ({ ...state, email: "" })));
      } else {
        setIsLoading(true);
        const response = await api.post("/user", {
          name: form.username,
          email: form.email,
          password: form.confirmPassword,
        });
        setIsLoading(false);
        const user = await Swal.fire({
          title: "Atenção!",
          text: response.data.message,
          type: response.data.status,
          showCloseButton: true,
        });
        if (user.value === true) history.push("/entrar");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      if (error.response?.data?.data?.email) {
        const message = `${error.response.data.message} ${error.response.data.data.email[0]}`;
        Swal.fire({
          html: `<p>${message}</p>`,
          type: error.response.data.status,
          showCloseButton: true,
        });
      } else {
        Swal.fire({
          title: "Erro!",
          text: `${error.response?.data?.status || error.message || error}`,
          type: "error",
          showCloseButton: true,
        });
      }
    }
  }

  const handleToogleShowPass = () => {
    setShowPassword(prevState => !prevState);
  };

  const handleToogleShowPassConfirm = () => {
    setShowPasswordConfirm(prevState => !prevState);
  };

  return (
    <div className="app flex-row align-items-center justify-content-center">
      <CContainer>
        <LoadPageHandler
          isLoading={isLoading}
          render={
            <CRow style={{ height: "100vh" }} className="justify-content-center align-items-center">
              <CCol md="9" lg="7" xl="6">
                <CCard className="mx-4 animated fadeIn">
                  <CCardBody className="p-4 text-center">
                    <>
                      <img src={logo} width="80%" className="logoFormCadastro mb-3" alt="MeuML" />
                      <h2 className="text-center">Cadastro</h2>
                      {emailWarning ? (
                        <p className="alert alert-info text-center">
                          Informe um e-mail válido e em uso, o provedor
                          <strong>&nbsp;@icloud&nbsp;</strong> não é aceito pela plataforma. Depois de
                          concluído o cadastro, cheque sua caixa de entrada pois enviaremos um link de
                          confirmação.
                        </p>
                      ) : (
                        <></>
                      )}
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <i className="cil-user" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type="text"
                          name="username"
                          id="username"
                          placeholder="Nome"
                          autoComplete="username"
                          required
                          onChange={({ target: { id, value } }) => handleInputChange({ id, value })}
                          value={form.username}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <i className="cil-at" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type="email"
                          name="email"
                          id="email"
                          placeholder="E-mail"
                          autoComplete="email"
                          required
                          onChange={({ target: { id, value } }) =>
                            handleInputChange({ id, value: value.toLowerCase() })
                          }
                          value={form.email}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <i className="cil-lock-locked" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          placeholder="Senha (min. 6 caracteres)"
                          autoComplete="password"
                          required
                          onChange={({ target: { id, value } }) => handleInputChange({ id, value })}
                          value={form.password}
                        />
                        <CInputGroupPrepend id="btn-showpass" onClick={handleToogleShowPass}>
                          <CInputGroupText>{showPassword ? <FaEyeSlash /> : <FaEye />}</CInputGroupText>
                        </CInputGroupPrepend>
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <i className="cil-lock-locked" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                          type={showPasswordConfirm ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          placeholder="Confirmar Senha"
                          autoComplete="password"
                          required
                          onChange={({ target: { id, value } }) => handleInputChange({ id, value })}
                          value={form.confirmPassword}
                        />
                        <CInputGroupPrepend id="btn-showpass" onClick={handleToogleShowPassConfirm}>
                          <CInputGroupText>
                            {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                          </CInputGroupText>
                        </CInputGroupPrepend>
                      </CInputGroup>
                    </>
                  </CCardBody>
                  <CCardFooter className="p-4">
                    <CRow>
                      <CCol xs="6" className="text-left">
                        <Link
                          className="btn btn-secondary d-flex justify-content-center"
                          to="/entrar"
                          style={{ width: "100px" }}
                        >
                          <i className="cil-arrow-left mr-2" /> Voltar
                        </Link>
                      </CCol>
                      <CCol xs="6" className="text-right">
                        <ButtonComponent
                          title="Concluir cadastro"
                          disabled={isLoading}
                          onClick={handleSubmit}
                          icon="cil-check"
                          width="100%"
                          variant=""
                        />
                      </CCol>
                    </CRow>
                  </CCardFooter>
                </CCard>
              </CCol>
            </CRow>
          }
        />
      </CContainer>
    </div>
  );
}

export default Cadastro;
