import React, { Component } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
import Swal from "sweetalert2";
// import { getToken } from "../../../services/auth";
import { Card, CardBody, Button } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
// import paginationFactory from "react-bootstrap-table2-paginator";

class MinhasListasDeBloqueio extends Component {
  constructor(props) {
    super(props);

    // this.toggleConta = this.toggleConta.bind(this);
    // this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      accountId: "",
      accountName: "",
      blackListName: "",
      accounts: [],
      backlistList: [],
      isLoadingBlacklistList: true,
      isLoadingAccounts: true,
      // nbloqueios: "2048",
      // nlistas: "48",
    };

    this.nbloqueios = "2048";
    this.nlistas = "48";
    // ...
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

  // fetchBlacklist(accountId, accountName) {
  //   this.setState({ accountId: accountId, accountName: accountName });
  // }

  // componentDidMount() {
  //   this.fetchAccounts();
  //   this.fetchBlacklistList();
  // }

  componentDidMount() {
    Swal.fire({
      title: "Funcionalidade descontinuada",
      type: "error",
      html: `<div>
              Não é mais possível listar bloqueios através da integração, apenas diretamente pelo Mercado Livre.
            </div>`,
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }

  // fetchAccounts() {
  //   this.url = process.env.REACT_APP_API_URL + `/accounts`;
  //   axios
  //     .get(this.url, { headers: { Authorization: "Bearer " + getToken() } })
  //     .then(res => {
  //       if (res.status === 200) {
  //         this.setState({
  //           accounts: res.data.data,
  //           isLoadingAccounts: false,
  //         });
  //         if (res.data.data.meta.total > 0) {
  //           this.fetchBlacklist(res.data.data[0].id);
  //         } else {
  //         }
  //       } else {
  //         Swal.fire({
  //           html: "<p>" + res.data.message + "</p>",
  //           type: "error",
  //           showConfirmButton: true,
  //         });
  //       }
  //     })
  //     .catch(error => {
  //       if (error.message === "Network Error") {
  //         window.location.reload();
  //       }
  //     });
  // }

  // fetchDeletarLista(id) {
  //   this.url = process.env.REACT_APP_API_URL + `/blacklist/list/` + id;
  //   axios
  //     .delete(this.url, { headers: { Authorization: "Bearer " + getToken() } })
  //     .then(res => {
  //       if (res.status === 200) {
  //         Swal.fire({
  //           html: "<p>Lista excluída com sucesso</p>",
  //           type: "success",
  //           showConfirmButton: true,
  //         });
  //       } else {
  //         Swal.fire({
  //           html: "<p>" + res.data.message + "</p>",
  //           type: "error",
  //           showConfirmButton: true,
  //         });
  //       }
  //       this.fetchBlacklistList();
  //     })
  //     .catch(error => {
  //       !error.response
  //         ? this.setState({ tipoErro: error })
  //         : this.setState({ tipoErro: error.response.data.message });
  //       Swal.fire({
  //         html: "<p>" + this.state.tipoErro + "<br /></p>",
  //         type: "error",
  //         showConfirmButton: false,
  //         showCancelButton: true,
  //         cancelButtonText: "Fechar",
  //       });
  //     });
  // }

  // fetchBlacklistList() {
  //   this.url = process.env.REACT_APP_API_URL + `/blacklist/list`;
  //   axios
  //     .get(this.url, { headers: { Authorization: "Bearer " + getToken() } })
  //     .then(res => {
  //       if (res.status === 200) {
  //         this.setState({
  //           backlistList: res.data.data,
  //           isLoadingBlacklistList: false,
  //           nlistas: res.data.meta.total,
  //         });
  //       } else {
  //         Swal.fire({
  //           html: "<p>" + res.data.message + "</p>",
  //           type: "error",
  //           showConfirmButton: true,
  //         });
  //       }
  //     })
  //     .catch(error => {
  //       return error;
  //     });
  // }

  // handleSubmit(event) {
  //   event.preventDefault();
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
  //         [
  //           {
  //             account_id: this.state.accountId,
  //             blacklist_name: this.state.blackListName,
  //           },
  //         ],
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
  //             type: "success",
  //             showCloseButton: false,
  //             showConfirmButton: true,
  //             textConfirmButton: "OK",
  //           });
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
  //         return error;
  //       });
  //   }
  // }

  render() {
    // const { backlistList } = this.state;
    const columns = [
      {
        dataField: "id",
        text: "ID",
        sort: true,
      },
      {
        dataField: "name",
        text: "Nome da Lista",
        sort: true,
      },
      {
        dataField: "description",
        text: "Descrição",
        sort: true,
      },
      {
        dataField: "df1",
        text: "Deletar Lista",
        isDummyField: true,
        formatter: (cellContent, row) => {
          return (
            <Button
              onClick={() => this.fetchDeletarLista(row.id)}
              className="btn btn-danger btn-sm"
              style={{ float: "right", marginRight: "45%" }}
            >
              <i className="fa fa-trash" />
            </Button>
          );
        },
      },
    ];
    // const options = {
    //   hideSizePerPage: true,
    //   defaultSortName: "name",
    //   defaultSortOrder: "desc",
    //   sizePerPage: this.props.sizePerPage,
    //   sizePerPageList: [50],
    //   page: this.props.currentPage,
    //   onSizePerPageList: this.props.onSizePerPageList,
    //   totalSize: this.props.totalDataSize,

    //   onPageChange: (page, sizePerPage) => this.props.onPageChange(page, sizePerPage),
    // };

    return (
      <div className="animated fadeIn">
        <Card className="card-accent-primary">
          <CardBody>
            {this.state.nlistas === 0 ? (
              <div className="alert alert-info fade show">Nenhuma lista de bloqueio cadastrada</div>
            ) : (
              <>
                {/* <Row>
                  <Link
                    to={"/bloquearemmassa"}
                    className="btn btn-primary mb-3 ml-3"
                    title="Salvar ou criar uma nova lista de bloqueio."
                  >
                    <i className="fa fa-plus-circle" /> Nova Lista
                  </Link>
                  <Button
                    className="mb-3 ml-1"
                    title="Total de Listas Salvas por você."
                    disabled
                    color="success"
                  >
                    <i className="fa fa-check" /> {this.state.nlistas}
                  </Button>
                </Row> */}
                <BootstrapTable
                  keyField="id"
                  // data={backlistList}
                  data={[]}
                  columns={columns}
                  striped
                  hover
                  bootstrap4
                  // pagination={paginationFactory(options)}
                  remote={true}
                  fetchInfo={{ dataTotalSize: this.props.totalDataSize }}
                  hidePageListOnlyOnePage={true}
                  title="Suas listas de bloqueios salvas."
                />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default MinhasListasDeBloqueio;
