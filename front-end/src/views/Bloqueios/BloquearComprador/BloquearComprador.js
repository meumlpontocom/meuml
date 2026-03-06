import React, { Component } from "react";
import { Link } from "react-router-dom";
// import axios from "axios";
import { RowContainer } from "./styles";
import Swal from "sweetalert2";
// import ReactLoading from "react-loading";
// import { getToken } from "../../../services/auth";
import SelectAccounts from "src/components/SelectAccounts";
import { CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel, CSwitch } from "@coreui/react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

class BloquearComprador extends Component {
  //Adaptar para os valores de motivos de bloqueio
  constructor(props) {
    super(props);

    // this.toggleConta = this.toggleConta.bind(this);
    // this.toggleMotivo = this.toggleMotivo.bind(this);
    // this.toggleFade = this.toggleFade.bind(this);
    // this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.selectMultipleOption = this.selectMultipleOption.bind(this);
    // this.changeBids = this.changeBids.bind(this);
    // this.changeQuestions = this.changeQuestions.bind(this);

    this.state = {
      dropdownOpenConta: false,
      dropdownOpenMotivo: false,
      accountId: "",
      accountName: "",
      accountsSelected: "",
      bids: true,
      customer_id: "",
      motivoBloqueio: "",
      motiveDescription: "",
      motiveId: "",
      questions: true,
      accounts: [],
      motivos: [],
      isLoadingAccounts: true,
      isLoadingMotivos: true,
      tipoUser: "ID",
      valueID: "",
      accountList: [],
      selectedOption: null,
      bloqueios: [],
      value: null,
      arrayValue: [],
      isLoadingCadastro: false,
    };
  }

  // toggleFade() {
  //   this.setState(prevState => ({ fadeIn: !prevState }));
  // }

  // toggleConta() {
  //   this.setState(prevState => ({
  //     dropdownOpenConta: !prevState.dropdownOpenConta,
  //   }));
  // }

  // toggleMotivo() {
  //   this.setState(prevState => ({
  //     dropdownOpenMotivo: !prevState.dropdownOpenMotivo,
  //   }));
  // }
  // componentDidMount() {
  //   this.fetchMotivos();
  // }
  // selectMultipleOption(arrayValue) {
  //   this.setState({ arrayValue });
  // }

  // async fetchMotivos() {
  //   try {
  //     this.url = process.env.REACT_APP_API_URL + `/blacklist/motives`;
  //     const res = await axios.get(this.url, { headers: { Authorization: "Bearer " + getToken() } });
  //     if (res.status === 200) {
  //       this.setState({
  //         motivos: res.data.data,
  //         isLoadingMotivos: false,
  //       });
  //       if (res.data.data.meta?.total > 0) {
  //         this.fetchMotivoSelecionado(res.data.data[0].id);
  //       }
  //     } else {
  //       Swal.fire({
  //         html: "<p>" + res.data.message + "</p>",
  //         type: "error",
  //         showConfirmButton: true,
  //       });
  //     }
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // }
  // handleInputChange(event) {
  //   const target = event.target;
  //   this.setState({
  //     [target.id]: target.value,
  //     isLoadingCadastro: false,
  //   });
  // }

  // changeBids() {
  //   this.setState(state => ({
  //     ...state,
  //     bids: !state.bids,
  //   }));
  // }
  // changeQuestions() {
  //   this.setState(state => ({
  //     ...state,
  //     questions: !state.questions,
  //   }));
  // }

  // handleChange = selectedOption => {
  //   this.setState({ isLoadingCadastro: false });
  //   this.setState({ selectedOption });
  // };

  // fetchMotivoSelecionado(motiveId, motiveName, motiveDescription) {
  //   this.setState({
  //     motiveId,
  //     motiveName,
  //     motiveDescription,
  //   });
  // }

  // fetchTipoUser(tipo) {
  //   this.setState({ tipoUser: tipo, customer_id: "" });
  // }

  // isEmpty(obj) {
  //   for (var key in obj) {
  //     if (obj.hasOwnProperty(key)) return false;
  //   }
  //   return true;
  // }

  handleSubmit(event) {
    Swal.fire({
      title: "Funcionalidade descontinuada",
      type: "error",
      html: `<div>
        Não é mais possível aplicar bloqueios através da integração, apenas diretamente pelo Mercado Livre.
      </div>`,
    });

    return;

    // this.setState({ isLoadingCadastro: true });
    // this.setState({ bloqueios: [] });
    // event.preventDefault();
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
    //   if (this.state.customer_id === "") {
    //     this.setState({ isLoadingCadastro: false });
    //     Swal.fire({
    //       html: "<p>Preencha o id ou usuário do comprador.</p>",
    //       type: "error",
    //       showCloseButton: false,
    //       showConfirmButton: true,
    //       textConfirmButton: "OK",
    //     });
    //   } else if (this.state.motiveId === "") {
    //     this.setState({ isLoadingCadastro: false });
    //     Swal.fire({
    //       html: "<p>Defina o motivo do bloqueio.</p>",
    //       type: "error",
    //       showCloseButton: false,
    //       showConfirmButton: true,
    //       textConfirmButton: "OK",
    //     });
    //   } else {
    //     this.state.arrayValue.forEach(s => {
    //       this.state.bloqueios.push({
    //         account_id: s.id,
    //         bids: this.state.bids,
    //         customer_id: this.state.customer_id,
    //         motive_description: this.state.motivoBloqueio,
    //         motive_id: this.state.motiveId,
    //         questions: this.state.questions,
    //       });
    //     });
    //     axios
    //       .post(process.env.REACT_APP_API_URL + `/blacklist`, this.state.bloqueios, {
    //         headers: {
    //           Authorization: "Bearer " + getToken(),
    //           "Content-Type": "application/json",
    //         },
    //       })
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
    //           this.props.history.push("/meusbloqueios");
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
    // const { isLoadingCadastro } = this.state;
    // const { isLoadingMotivos, motivos } = this.state;
    return (
      <div className="animated fadeIn">
        <RowContainer>
          <Col xs="12" sm="12" md="12" xl="12" style={{ maxWidth: "1300px" }}>
            <Card className="card-accent-primary">
              <Form onSubmit={this.handleSubmit} name="bloquearcomprador" autoComplete="off">
                <input type="hidden" value="autoCompleteOff" />
                <CardBody>
                  <Row>
                    <Col xs="12" sm="6" md="6">
                      <Col xs="12" className="mb-3" style={{ paddingLeft: 0 }}>
                        <label htmlFor="select-account-dropdown">Selecionar conta:</label>
                        <SelectAccounts
                          platform="ML"
                          multipleSelection={true}
                          selected={this.state.arrayValue}
                          callback={this.selectMultipleOption}
                          placeholder="Selecionar conta(s) Mercado Livre"
                          disabled
                        />
                      </Col>
                      <Label for="idUsusario">ID do comprador</Label>
                      <Row
                        style={{
                          width: "100%",
                          alignItems: "center",
                          margin: 0,
                        }}
                        className="mb-2"
                      >
                        <Col xs="12" style={{ padding: 0 }}>
                          <CLabel htmlFor="user-id">
                            <CInputGroup>
                              <CInputGroupPrepend>
                                <CInputGroupText>ID</CInputGroupText>
                              </CInputGroupPrepend>
                              <Input
                                disabled
                                type="text"
                                name="customer_id"
                                id="idUsuario"
                                placeholder={
                                  this.state.tipoUser === "ID"
                                    ? "Digite o ID do comprador"
                                    : "Digite o Apelido do comprador"
                                }
                                autoComplete="off"
                                autoFocus={true}
                                color="outline-dark"
                                required
                                value={this.state.customer_id}
                                // onChange={event => {
                                //   if (this.state.tipoUser === "ID") {
                                //     if (isNaN(Number(event.target.value))) {
                                //       return;
                                //     } else {
                                //       this.setState({
                                //         customer_id: event.target.value,
                                //       });
                                //     }
                                //   } else {
                                //     this.setState({
                                //       customer_id: event.target.value,
                                //     });
                                //   }
                                // }}
                              />
                              <small>
                                Utilize a <Link to="/pesquisar-dados">pesquisa de dados públicos</Link> para
                                descobrir um ID de usuário.
                              </small>
                            </CInputGroup>
                          </CLabel>
                        </Col>
                      </Row>
                      <FormGroup>
                        <Label for="idMotivo">Selecione o motivo do bloqueio</Label>
                        {/* {!isLoadingMotivos ? ( */}
                        <Dropdown
                          disabled
                          direction="right"
                          id="idMotivo"
                          className="dropAbaixo2"
                          isOpen={this.state.dropdownOpenMotivo}
                          toggle={() => {
                            this.toggleMotivo();
                          }}
                        >
                          <DropdownToggle caret color="primary" size="md" disabled>
                            {!this.state.motiveId
                              ? "Selecione um motivo!"
                              : this.state.motiveId + " - " + this.state.motiveName}
                          </DropdownToggle>
                          <DropdownMenu>
                            {/* {motivos.map((m, key) => { */}
                            {[].map((m, key) => {
                              return (
                                <DropdownItem
                                  key={m.key}
                                  onClick={() => this.fetchMotivoSelecionado(m.key, m.name, m.description)}
                                >
                                  {m.key} - {m.name}
                                </DropdownItem>
                              );
                            })}
                          </DropdownMenu>
                        </Dropdown>
                        {/* ) : (
                          <h3>Carregando...</h3>
                        )} */}
                      </FormGroup>
                    </Col>
                    <Col xs="12" sm="6" md="6">
                      <FormGroup>
                        <Label for="motivoBloqueio">
                          Descreva o motivo do bloqueio <em>(opcional)</em>
                        </Label>
                        <Input
                          disabled
                          type="textarea"
                          name="motivoBloqueio"
                          id="motivoBloqueio"
                          rows="3"
                          color="outline-dark"
                          // onChange={this.handleInputChange}
                          value={this.state.motivoBloqueio}
                        />
                      </FormGroup>
                      <FormGroup className="box-toggle">
                        <Label className="mr-5">Compras: </Label>
                        <span className="textoSwitch">Desbloquear</span>
                        <CSwitch
                          disabled
                          className="mx-1"
                          variant="pill"
                          color="danger"
                          name="bids"
                          checked={this.state.bids}
                          // onChange={this.changeBids}
                        />
                        <span className="textoSwitch">Bloquear</span>
                      </FormGroup>
                      <FormGroup className="box-toggle">
                        <Label className="mr-5">Perguntas: </Label>
                        <span className="textoSwitch">Desbloquear</span>
                        <CSwitch
                          disabled
                          className={"mx-1"}
                          variant={"pill"}
                          color={"danger"}
                          name="questions"
                          checked={this.state.questions}
                          // onChange={() => this.changeQuestions(this.state.questions)}
                        />
                        <span className="textoSwitch">Bloquear</span>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter className="text-right">
                  {/* {!isLoadingCadastro ? ( */}
                  <div>
                    <Button type="submit" size="md" color="primary" disabled>
                      <i className="fa fa-lock" /> Processar
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
        </RowContainer>
      </div>
    );
  }
}
export default BloquearComprador;
