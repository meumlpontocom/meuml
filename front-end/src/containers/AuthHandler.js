import React, { Component, createContext } from 'react';
import { Redirect } from 'react-router-dom';
import { validateToken } from '../services/auth';
export const AuthContainer = createContext();

export default class AuthHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    }

    this.events = [
      "load",
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress"
    ];

    this.checkTokenTimer = setInterval(() => {
      this.setRedirectIfNotAuthenticated();
    }, 5000);

    this.eventTimer = null;
    this.setTimeOut = this.setTimeOut.bind(this);
  }

  componentDidMount() {
    this.setRedirectIfNotAuthenticated();
    this.events.map(event => window.addEventListener(event, this.handleTimer));
  }

  handleTimer = () => {
    if (!this.isPrivateRoute) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    } else {
      clearTimeout(this.eventTimer);
      this.setTimeOut();
    }
  };

  setTimeOut() {
    this.eventTimer = setTimeout(() => {
      this.setState({ redirect: true });
    }, 3600000);
  }

  setRedirectIfNotAuthenticated = () => {
    if (!this.isPrivateRoute() && !validateToken()) {
      this.setState({ redirect: true });
    }
    else this.setState({ redirect: false });
  }

  isPrivateRoute = () => {
    const location = window.location.href.split('#', -1);
    return (
      location[1] !== '/entrar' && location[1] !== '/cadastro' && location[1] !== '/alterarsenha' &&
      location[1] !== '/confirmarcadastro' && location[1] !== '/callback'
    );
  }

  renderRedirect = () => (
    this.state.redirect
      ? <Redirect to={"/logout"} />
      : <></>
  );

  render() {
    return (
      <AuthContainer.Provider
        value={{
          state: this.state,
        }}
      >
        {this.renderRedirect()}
        {this.props.children}
      </AuthContainer.Provider>
    );
  }
}
