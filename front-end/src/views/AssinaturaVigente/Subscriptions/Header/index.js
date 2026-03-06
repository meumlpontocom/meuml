import React from "react";
import { CardHeader } from "reactstrap";
import "./index.css";

export default function Header({ price, name, accounts, expirationDate }) {
  const date = String(expirationDate.split(",")[1]).split("GMT")[0];
  return (
    <CardHeader className="card-header">
      <h4 className="d-flex justify-content-between">
        <span className="d-flex align-items-center">
          PLANO {name}
          <i className={`cil-badge mr-1 ml-1 ${name === "GRATUITO" ? "free-badge" : "professional-badge"}`} />
        </span>
        <span className="price d-flex align-items-center">
          <i className="cil-money mr-1" />
          {price}
        </span>
      </h4>
      <h6>Contas Assinantes: {accounts}</h6>
      <h6>{expirationDate === "Ilimitado" ? <></> : `Válido até ${date.substring(0, date.length - 4)}h`}</h6>
    </CardHeader>
  );
}
