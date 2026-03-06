import React from "react";
import "./logo.css";
import { Container } from "reactstrap";
import logo from "../../../assets/img/Logo-transparente.png";
const Logo = props => (
  <Container>
    <img src={logo} width={props.width} id="logo" alt="MeuML" />
  </Container>
);
export default Logo;
