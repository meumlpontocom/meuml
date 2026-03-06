import React from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import store from "../../../../../../redux/store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Container from "reactstrap/lib/Container";
import DescriptionInput from "./DescriptionInput";
import ListingTypeInput from "./ListingTypeInput";
import FreeShippingInput from "./FreeShippingInput";
import ConditionInput from "./ConditionInput";
import QuantityInput from "./QuantityInput";
import EAN from "./EAN";
import ButtonComponent from "src/components/ButtonComponent";

export default function AdvertBulkEdit() {
  const dispatch = useDispatch();
  const ReactSwal = withReactContent(Swal);
  const { selectAll, selectedAdverts } = useSelector(state => state.advertsReplication);

  function confirmBulkEdition(user) {
    dispatch({
      type: "REPLICATION_BULK_UPDATE_DATA",
      payload: { id: "confirmed", value: user },
    });
  }

  function advertBulkEdition() {
    ReactSwal.fire({
      title: "Atualização em massa",
      type: "question",
      showConfirmButton: true,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: "Salvar",
      cancelButtonText: "Cancelar",
      html: (
        <Container>
          <Provider store={store}>
            <QuantityInput />
            <ConditionInput />
            <FreeShippingInput />
            <ListingTypeInput />
            <DescriptionInput />
            <EAN />
          </Provider>
        </Container>
      ),
    }).then(user => {
      confirmBulkEdition(user.value ? true : false);
    });
  }
  return !selectAll && !selectedAdverts.length ? (
    <></>
  ) : (
    <ButtonComponent
      onClick={advertBulkEdition}
      title="Editar selecionados"
      icon="cil-color-border"
      width="100%"
    />
  );
}
