import React from "react";
import { Card, CardBody, CardFooter, Container } from "reactstrap";
import { Link } from "react-router-dom";
import lock from "../../assets/img/lock.png";

export default function CallToActionPage() {
  return (
    <Container
      className="d-flex justify-content-center"
      style={{
        marginTop: "10%",
      }}
    >
      <Card
        style={{
          maxWidth: "60vh",
          backgroundImage: "linear-gradient(#fcfffc, #d3d8e0)",
          color: "black",
        }}
      >
        <CardBody className="text-center">
          <h1 className="text-center">Olá, </h1>
          <h2 className="mb-3">Esta funcionalidade não faz parte do seu pacote atual.</h2>
          <img
            style={{
              width: "25vh",
              zIndex: -1,
            }}
            alt="cadeado"
            src={lock}
          />
          <h3 className="text-center mt-5">Gostaria de assinar esta funcionalidade?</h3>
        </CardBody>
        <CardFooter
          className="text-center"
          style={{
            backgroundImage: "linear-gradient(#d3d8e0, #dfdfdf)",
            borderTop: "0px",
          }}
        >
          <Link
            title="Visite a página de assinaturas."
            className="btn btn-pill btn-outline-primary btn-lg"
            to="/assinaturas/planos"
          >
            <i className="cil-lock-unlocked mr-1" /> Conheça nossos planos!
          </Link>
        </CardFooter>
      </Card>
    </Container>
  );
}
