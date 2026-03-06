import "./styles.scss";
import React, { Component } from "react";
import Swal from "sweetalert2";
import { Link, Redirect } from "react-router-dom";
import api from "../../../services/api";
import { login } from "../../../services/auth";
import logo from "../../../assets/img/brand/MeuML-logo2.png";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CRow,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
} from "@coreui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      token: "",
      message: "",
      status: "",
      tipoErro: "",
      expiresin: "",
      noClick: false,
      isLoading: false,
      successLogin: false,
      showPassword: false,
    };

    this.submitInput = React.createRef();
    this.focusSubmitInput = this.focusSubmitInput.bind(this);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleToogleShowPass = this.handleToogleShowPass.bind(this);
  }

  componentDidMount() {
    if (this.props.isAuthenticated) this.setState({ successLogin: true });
  }

  loginAssign() {
    if (this.state.successLogin) {
      return <Redirect to="/home" />;
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  validateLogin() {
    if (this.state.email) {
      if (this.state.password) {
        if (this.state.password.length >= 6) return "ok";
        else return "password";
      } else return "password";
    } else return "email";
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.validateLogin() === "ok") {
      this.setState({ isLoading: true });
      api
        .post("/auth/login", {
          email: this.state.email.toLowerCase(),
          password: this.state.password,
        })
        .then(response => {
          this.setState({ isLoading: false });
          this.setState({ message: response.data.message });
          if (response.data.status === "success") {
            login(
              response.data.data.jwt,
              response.data.data.expires_in,
              response.data.data.user.email,
              response.data.data.user.is_admin,
            );
            this.setState({ successLogin: true });
          } else if (response.data.statusCode === 403) {
            this.props.history.push(`/confirmar-cadastro/${this.state.email.toLowerCase()}`);
          } else {
            Swal.fire({
              html: `<p>${response.data.message}</p>`,
              type: response.data.status,
              showConfirmButton: true,
              onClose: () => {
                this.props.history.push("/entrar");
                window.location.reload();
              },
            });
          }
        })
        .catch(error => {
          this.setState({ isLoading: false });
          if (error?.response?.data?.statusCode === 403) {
            this.props.history.push(`/confirmar-cadastro/${this.state.email.toLowerCase()}`);
          } else {
            if (error.response) {
              Swal.fire({
                title: "Atenção!",
                html: `<p>${error.response.data.message}</p>`,
                type: "error",
                showCloseButton: true,
              });
            } else {
              Swal.fire({
                type: "error",
                title: "Atenção!",
                html: "<p>Não foi possível fazer login.</p><p>Tente novamente mais tarde</p>",
                showCloseButton: true,
              });
            }
            return error;
          }
        });
    } else if (this.validateLogin() === "password") {
      Swal.fire({
        title: "Atenção!",
        html: `<p>Por favor, verifique a senha informada.</p>`,
        type: "warning",
        showCloseButton: true,
      });
    } else if (this.validateLogin() === "email") {
      Swal.fire({
        title: "Atenção!",
        html: `<p>Por favor, informe um email válido.</p>`,
        type: "warning",
        showCloseButton: true,
      });
    }
  }

  focusSubmitInput() {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    this.submitInput.current.focus();
  }

  handleToogleShowPass() {
    this.setState({
      showPassword: !this.state.showPassword,
    });
  }

  render() {
    return (
      <div className="c-app">
        {this.loginAssign()}
        <CContainer className="c-wrapper">
          <CCol className="c-body login-cards">
            <CCardGroup className="login-card-width">
              <CCard className="col-md-6 col-xm-12">
                <CCardBody className="text-center mt-0 mt-sm-4">
                  <h2>
                    <img src={logo} width="90%" className="espacoLogoCadastro" alt="MeuML" />
                  </h2>
                  <p>Ainda não é cadastrado?</p>
                  <Link to="/cadastro">
                    <CButton color="primary" className="px-4" tabIndex={-1}>
                      Cadastre-se!
                    </CButton>
                  </Link>
                </CCardBody>
              </CCard>
              <CCard className="col-md-6 col-xm-12">
                <CCardBody className="mt-0 mt-sm-4">
                  <CForm onSubmit={this.handleSubmit}>
                    <h2 className="tituloLogin">Acesse sua conta</h2>
                    <CInputGroup className="mb-3">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <i className="cil-envelope-closed" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput
                        type="email"
                        id="email"
                        name="email"
                        value={this.state.email.toLowerCase()}
                        placeholder="E-mail"
                        onChange={this.handleInputChange}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <i className="cil-lock-locked" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput
                        type={this.state.showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={this.state.password}
                        placeholder="Senha"
                        onChange={this.handleInputChange}
                      />
                      <CInputGroupPrepend id="btn-showpass" onClick={this.handleToogleShowPass}>
                        <CInputGroupText>
                          {!this.state.showPassword ? <FaEyeSlash /> : <FaEye />}
                        </CInputGroupText>
                      </CInputGroupPrepend>
                    </CInputGroup>
                    <CRow className="d-flex flex-row-reverse flex-sm-row justify-content-between">
                      <CCol xs="5">
                        <CButton
                          id="login"
                          name="login"
                          type="submit"
                          value="Entrar"
                          color="primary"
                          className="px-4"
                          disabled={this.state.isLoading}
                        >
                          Entrar
                        </CButton>
                      </CCol>
                      <CCol xs="7" className="text-left text-sm-right">
                        <CButton
                          className="pl-0"
                          color="link"
                          onClick={() => window.location.assign("#/recuperar-senha")}
                        >
                          Recuperar Senha
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CContainer>
      </div>
    );
  }
}

export default Login;
