import React, { Component } from "react";
import { getToken } from "../../../services/auth";
import ReactLoading from "react-loading";
import api from "../../../services/api";
import { Redirect } from "react-router-dom";

export default class CallBack extends Component {
  // callback?code=TG-5f7f665d074b960006d4b059-250102780&state=qQLKqGp5hRvTh5FgOpw8FJ5adOKYg6
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      status: "",
      redirect: false,
    };
  }
  componentDidMount() {
    const code = window.location.href.split("code=")[1].split("&")[0];
    const shop_id = window.location.href.split("shop_id=")[1];
    const url = `/shopee/callback?code=${code}&shop_id=${shop_id}`;
    const headers = { headers: { Authorization: `Bearer ${getToken()}` } };
    api
      .post(url, {}, headers)
      .then(({ data: { message, status } }) => {
        this.setState({ status, message, redirect: true });
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || error?.message || error;
        this.setState({ status: "error", message, redirect: true });
      });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Redirection
          redirect={this.state.redirect}
          message={this.state.message}
          status={this.state.status}
        />
        <ReactLoading
          type={"spinningBubbles"}
          color={"#054785"}
          height={100}
          width={100}
          className="spinnerStyle"
        />
      </div>
    );
  }
}

const Redirection = ({ redirect, message, status }) => {
  return redirect ? (
    <Redirect to={{ pathname: "/contas", state: { message, status } }} />
  ) : (
    <></>
  );
};
