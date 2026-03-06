// React & Redux
import React from "react";
import store from "../../../../../../../redux/store";
import { Provider, useDispatch, useSelector } from "react-redux";
// Popup
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// Reactstrap
import Container from "reactstrap/lib/Container";

export default function EditionPopup({ title, children, icon, id }) {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(
    (state) => state.advertsReplication
  );

  const ReactSwal = withReactContent(Swal);
  const saveEditedAdvert = () => {
    dispatch({ type: "REPLICATION_SAVE_EDITED_ADVERT" });
  };
  const createAdvertEditableCopy = () => {
    if (!advertBeingEdited);
    dispatch({ type: "REPLICATION_SAVE_ADVERT_BEING_EDITED", payload: id });
  };

  return (
    <span
      style={{ cursor: "pointer" }}
      className={`cil-${icon}`}
      onClick={() => {
        createAdvertEditableCopy();
        ReactSwal.fire({
          title: title,
          type: "question",
          html: (
            <Provider store={store}>
              <Container>{children}</Container>
            </Provider>
          ),
          showCloseButton: true,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Salvar",
          cancelButtonText: "Cancelar",
        }).then((user) => {
          if (user.value) saveEditedAdvert();
        });
      }}
    />
  );
}
