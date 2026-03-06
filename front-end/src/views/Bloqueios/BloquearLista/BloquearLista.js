/* eslint-disable array-callback-return */
/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from "react";
import { CSwitch } from "@coreui/react";
// import axios from "axios";
import Swal from "sweetalert2";
// import { getToken } from "../../../services/auth";
import { Picky } from "react-picky";
// import LoadingCardData from "../../../components/LoadingCardData";
import { Card, CardBody, CardFooter, Form, Label, FormGroup, Input, Button, Col, Row } from "reactstrap";

class BloquearLista extends Component {
  constructor(props) {
    super(props);
    // this.toggleConta = this.toggleConta.bind(this);
    // this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.selectMultipleOption = this.selectMultipleOption.bind(this);
    // this.changeBids = this.changeBids.bind(this);
    // this.changeQuestions = this.changeQuestions.bind(this);
    this.state = {
      accountName: "",
      blackListName: "",
      accounts: [],
      bids: false,
      questions: false,
      backlistList: [],
      isLoadingBlacklistList: true,
      isLoadingAccounts: true,
      accountId: null,
      value: null,
      arrayValue: [],
      isLoadingCadastro: false,
    };
    this.nbloqueios = "2048";
    this.nlistas = "48";
  }

  // handleInputChange(event) {
  //   const target = event.target;
  //   const value = target.value;
  //   const name = target.name;

  //   this.setState({
  //     [name]: value,
  //   });
  // }

  // toggleConta() {
  //   this.setState(prevState => ({
  //     dropdownOpenConta: !prevState.dropdownOpenConta,
  //   }));
  // }

  // componentDidMount() {
  //   this.fetchAccounts();
  // }

  // fetchAccounts() {
  //   this.url = process.env.REACT_APP_API_URL + `/accounts`;
  //   axios
  //     .get(this.url, { headers: { Authorization: "Bearer " + getToken() } })
  //     .then(res => {
  //       if (res.status === 200) {
  //         const listaContas = [];
  //         const resContas = res.data.data;
  //         resContas.map((c, k) => {
  //           listaContas.push({ value: c.id, label: c.name });
  //         });
  //         this.setState({
  //           accounts: listaContas,
  //           isLoadingAccounts: false,
  //         });
  //         if (res.data.meta.total > 0) {
  //           if (res.data.meta.total === 1) {
  //             this.setState({
  //               arrayValue: [{ value: res.data.data[0].id, label: res.data.data[0].name }],
  //               accountId: [res.data.data[0].id],
  //             });
  //           }
  //         } else {
  //           Swal.fire({
  //             title: "",
  //             text: "Você precisa ter ao menos 1 conta!",
  //             type: "info",
  //             showCancelButton: false,
  //             confirmButtonColor: "#366B9D",
  //             confirmButtonText: "OK",
  //             confirmButtonClass: "btn btn-success",
  //             buttonsStyling: true,
  //           }).then(function () {
  //             window.location.href = "#/contas";
  //           });
  //         }
  //       }
  //     })
  //     .catch(error => {
  //       if (error.message === "Network Error") {
  //         window.location.reload();
  //       } else {
  //         !error.response
  //           ? this.setState({ tipoErro: error })
  //           : this.setState({ tipoErro: error.response.data.message });
  //         Swal.fire({
  //           html: "<p>" + this.state.tipoErro + "<br /></p>",
  //           type: "error",
  //           showConfirmButton: false,
  //           showCancelButton: true,
  //           cancelButtonText: "Fechar",
  //         });
  //       }
  //     });
  // }

  // selectMultipleOption(value) {
  //   this.setState({ arrayValue: value });
  //   //Prepara o array para ser manipulado
  //   this.state.values = value;
  //   this.state.accountId = [];

  //   const valuesToRender = this.state.values.filter(val => val.value);
  //   const numRows = valuesToRender.length;

  //   for (var i = 0; i < numRows; i++) {
  //     this.state.accountId.push(value[i].value);
  //   }
  // }

  // isEmpty(obj) {
  //   for (var key in obj) {
  //     if (obj.hasOwnProperty(key)) return false;
  //   }
  //   return true;
  // }

  // changeBids() {
  //   this.setState(state => {
  //     return {
  //       ...state,
  //       bids: !state.bids,
  //     };
  //   });
  // }
  // changeQuestions(status) {
  //   this.setState(state => {
  //     return {
  //       ...state,
  //       questions: !state.questions,
  //     };
  //   });
  // }

  handleSubmit(event) {
    // this.setState({ isLoadingCadastro: true });
    event.preventDefault();

    Swal.fire({
      title: "Funcionalidade descontinuada",
      type: "error",
      html: `<div>
            Não é mais possível aplicar bloqueios através da integração, apenas diretamente pelo Mercado Livre.
          </div>`,
      showConfirmButton: true,
      confirmButtonText: "OK",
    });

    return;

    // if (this.isEmpty(this.state.arrayValue)) {
    //   this.setState({ isLoadingCadastro: false });
    //   Swal.fire({
    //     html: "<p>Selecione uma conta para realizar o bloqueio!</p>",
    //     type: "error",
    //     showCloseButton: false,
    //     showConfirmButton: true,
    //     textConfirmButton: "OK",
    //   });
    // } else {
    //   if (this.state.blackListName === "") {
    //     Swal.fire({
    //       html: "<p>Preencha o nome da lista para bloqueá-la</p>",
    //       type: "error",
    //       showConfirmButton: false,
    //       showCancelButton: true,
    //       cancelButtonText: "Fechar",
    //     });
    //   } else {
    //     axios
    //       .post(
    //         process.env.REACT_APP_API_URL + `/blacklist/list/import`,
    //         {
    //           blacklist_name: this.state.blackListName,
    //           accounts: this.state.accountId,
    //           bids: this.state.bids,
    //           questions: this.state.questions,
    //         },
    //         {
    //           headers: {
    //             Authorization: "Bearer " + getToken(),
    //             "Content-Type": "application/json",
    //           },
    //         },
    //       )
    //       .then(res => {
    //         const status = res.data.status;
    //         this.setState({ status });
    //         if (this.state.status === "success") {
    //           const message = res.data.message;
    //           this.setState({ message });
    //           Swal.fire({
    //             html: "<p>" + this.state.message + "</p>",
    //             type: this.state.status,
    //             showCloseButton: false,
    //             showConfirmButton: true,
    //             textConfirmButton: "OK",
    //           });
    //           this.setState({ isLoadingCadastro: false });
    //           window.location.href = "#/minhaslistasdebloqueios";
    //         } else {
    //           const message = res.data.message;
    //           this.setState({ message });
    //           Swal.fire({
    //             html: "<p>" + this.state.message + "</p>",
    //             type: "error",
    //             showConfirmButton: true,
    //           });
    //         }
    //       })
    //       .catch(error => {
    //         this.setState({ isLoadingCadastro: false });
    //         !error.response
    //           ? this.setState({ tipoErro: error })
    //           : this.setState({ tipoErro: error.response.data.message });
    //         Swal.fire({
    //           html: "<p>" + this.state.tipoErro + "<br /></p>",
    //           type: "error",
    //           showConfirmButton: false,
    //           showCancelButton: true,
    //           cancelButtonText: "Fechar",
    //         });
    //       });
    //   }
    // }
  }

  componentDidMount() {
    Swal.fire({
      title: "Funcionalidade descontinuada",
      type: "error",
      html: `<div>
              Não é mais possível aplicar bloqueios através da integração, apenas diretamente pelo Mercado Livre.
            </div>`,
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }

  render() {
    // const { isLoadingAccounts, accounts } = this.state;
    // const { isLoadingCadastro } = this.state;
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12" md="10" xl="8">
            <Card className="card-accent-primary">
              <Form name="novaLista" onSubmit={this.handleSubmit} autoComplete="off">
                <input type="hidden" value="autoCompleteOff" />
                <CardBody>
                  <Row>
                    <Col md="12" xs="12">
                      <FormGroup>
                        <Label for="idConta">Conta do Mercado Livre</Label>
                        {/* {!isLoadingAccounts ? ( */}
                        <Picky
                          disabled
                          value={this.state.arrayValue}
                          // options={accounts}
                          options={[]}
                          // onChange={this.selectMultipleOption}
                          className="multiSelBlockListOutros"
                          open={false}
                          valueKey="value"
                          labelKey="label"
                          multiple={true}
                          includeSelectAll={true}
                          includeFilter={true}
                          dropdownHeight={600}
                          placeholder="Selecione..."
                          manySelectedPlaceholder="%s Selecionados"
                          allSelectedPlaceholder="%s Selecionados"
                          selectAllText="Selecionar Todos"
                          filterPlaceholder="Filtrar por..."
                        />
                        {/* ) : (
                          <LoadingCardData />
                        )} */}
                      </FormGroup>
                    </Col>
                    <Col md={12} xs={12}>
                      <Row>
                        <Col md="6" xs="12">
                          <FormGroup>
                            <Label for="idUsusario">Nome da lista para bloquear</Label>
                            <Input
                              disabled
                              type="text"
                              name="blackListName"
                              id="blackListName"
                              placeholder="Nome da lista"
                              autoComplete="off"
                              autoFocus={true}
                              required
                              // onChange={this.handleInputChange}
                              value={this.state.blackListName}
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6" xs="12" style={{ color: "#000", fontWeight: "bold" }}>
                          <FormGroup>
                            <CSwitch
                              disabled
                              size="sm"
                              className="mx-1"
                              variant="pill"
                              color="danger"
                              name="bids"
                              checked={this.state.bids}
                              // onChange={this.changeBids}
                            />
                            <span> Bloquear para compras</span>
                          </FormGroup>
                          <FormGroup>
                            <CSwitch
                              disabled
                              size="sm"
                              className="mx-1"
                              variant="pill"
                              color="danger"
                              name="questions"
                              checked={this.state.questions}
                              // onChange={this.changeQuestions}
                            />
                            <span>Bloquear para perguntas</span>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter className="text-right">
                  {/* {!isLoadingCadastro ? ( */}
                  <div>
                    <Button type="submit" size="sm" color="primary" disabled>
                      <i className="fa fa-file-text" /> Bloquear Lista
                    </Button>
                  </div>
                  {/* ) : (
                    <ReactLoading
                      type={"spinningBubbles"}
                      color={"#054785"}
                      height={30}
                      width={30}
                      className="spinnerStyleMini"
                    />
                  )} */}
                </CardFooter>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default BloquearLista;
