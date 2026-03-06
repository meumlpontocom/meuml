import React from "react";
import { Link } from "react-router-dom";
import CardFooter from "reactstrap/lib/CardFooter";

export default function Footer() {
  return (
    <CardFooter>
      <Link
        className="btn btn-primary"
        to={{ pathname: "/qualidade-do-anuncio" }}
      >
        <i className="cil-arrow-left mr-1" />
        Voltar
      </Link>
    </CardFooter>
  );
}
