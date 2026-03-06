import React, { useState, useEffect } from "react";
import {
  Button,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Row,
  Col,
} from "reactstrap";
import { ModalContainer } from "./styles";
import { Link } from "react-router-dom";

// import { Container } from './styles';

export default function ModalNoPermission({
  openModal,
  closeModal,
  sendButton,
  noPermission,
}) {
  const [toggleModal, setToggleModal] = useState(false);

  useEffect(() => {
    setToggleModal(openModal);
  }, [openModal]);

  return (
    <ModalContainer isOpen={toggleModal} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        Deseja executar as alterações em massa?
      </ModalHeader>
      <ModalBody>
        {noPermission && (
          <>
            <Row className="mb-1">
              <Col xs={10}>
                <p>
                  As alterações das contas <b>{noPermission.join(", ")} </b>
                  não serão executadas devido a não terem planos vinculados.
                  Para adquirir o plano, acesse:
                </p>
              </Col>
            </Row>
            <Row>
              <Col xs={10}>
                <Link to="/creditos/planos"> Adquirir Plano</Link>
              </Col>
            </Row>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closeModal}>
          Cancelar
        </Button>
        <Button color="primary" onClick={sendButton}>
          Executar
        </Button>
      </ModalFooter>
    </ModalContainer>
  );
}
