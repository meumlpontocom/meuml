import React, { useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../../../../../redux/store";
import { Container, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import ButtonComponent from "src/components/ButtonComponent";
import Conditional from "src/components/Conditional";

export default function EditionPopup({ title, children, input, advertThumb, singular, id }) {
  const dispatch = useDispatch();
  const { editShowConfirmButton } = useSelector(state => state.advertsReplication);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const createAdvertEditableCopy = () => {
    dispatch({ type: "REPLICATION_SAVE_ADVERT_BEING_EDITED", payload: id });
  };

  const saveEditedAdvert = () => {
    dispatch({ type: "REPLICATION_SAVE_EDITED_ADVERT" });
    toggleModal();
  };

  return (
    <>
      <span
        style={{ cursor: "pointer" }}
        onClick={() => {
          createAdvertEditableCopy();
          toggleModal();
        }}
      >
        {children}
      </span>

      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" centered>
        <ModalHeader toggle={toggleModal}>{singular ? title : ""}</ModalHeader>
        <ModalBody>
          <Provider store={store}>
            <Container>
              {!singular ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <h2 className="text-primary">{title}</h2>
                  <img
                    style={{ padding: "15px" }}
                    alt="Imagem do Anúncio"
                    src={advertThumb.replace("http", "https")}
                  />
                </div>
              ) : null}
            </Container>
          </Provider>
          {input}
        </ModalBody>
        <ModalFooter>
          <div style={{ display: "flex", width: "100%", gap: "32px" }}>
            <Conditional render={editShowConfirmButton}>
              <ButtonComponent
                color="primary"
                onClick={saveEditedAdvert}
                title="Salvar"
                width="100%"
                height="50"
              />
            </Conditional>
            <ButtonComponent color="dark" onClick={toggleModal} title="Cancelar" width="100%" height="50" />
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
