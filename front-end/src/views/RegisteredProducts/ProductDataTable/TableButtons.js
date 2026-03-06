import React, { useContext, useState } from "react";
import Swal                            from "sweetalert2";
import { CButton, CSpinner }           from "@coreui/react";
import { RegisteredProductsContext }   from "../RegisteredProductsContext";
import { Spinner }                     from "src/components/Spinner";

export default function TableButtons({
  id,
  sku,
  toggleDetails,
  update,
  isOpen,
  isLoadingEditBtn,
}) {
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const { isPending, handleDelete } = useContext(RegisteredProductsContext);

  async function handleDeleteBtnClick() {
    const userChoice = await Swal.fire({
      title: "Atenção",
      type: "warning",
      text: "Você tem certeza que deseja apagar este produto para sempre?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sim, apagar!",
      cancelButtonText: "Cancelar",
    });
    if (userChoice.value) await handleDelete(id, setIsPendingDelete);
  }

  return (
    <td className="py-2 table-buttons">
      <CButton
        disabled={isPending}
        className={isOpen ? "btn-primary" : "btn-outline-primary"}
        size="sm"
        onClick={() => toggleDetails(id)}
      >
        {!isOpen ? (
          <span>
            <i className="cil-chevron-circle-down-alt" />
            &nbsp;Detalhes
          </span>
        ) : (
          <span>
            <i className="cil-chevron-circle-up-alt" />
            &nbsp;Fechar
          </span>
        )}
      </CButton>
      <CButton
        disabled={isPending || !sku}
        title={!sku ? "Produto principal precisa ter SKU" : undefined}
        variant="outline"
        color="success"
        size="sm"
        className="d-flex align-items-center justify-content-center variation-button"
        onClick={() => update("isVariation")}
      >
        Cadastrar Variação
        <i className="cil-plus ml-1" />
      </CButton>
      <CButton
        disabled={isPending}
        variant="outline"
        color="warning"
        size="sm"
        className="d-flex align-items-center justify-content-center"
        onClick={() => update("isEditing")}
      >
        Editar
        {isLoadingEditBtn === id ? (
          <Spinner color="#F9B115" width={20} height={20} />
        ) : (
          <i className="cil-pencil ml-1" />
        )}
      </CButton>
      <CButton
        disabled={isPending}
        variant="outline"
        color="danger"
        size="sm"
        className="d-flex align-items-center justify-content-center"
        onClick={handleDeleteBtnClick}
      >
        Excluir
        {isPendingDelete ? (
          <CSpinner size="sm" />
        ) : (
          <i className="cil-trash ml-1" />
        )}
      </CButton>
    </td>
  );
}
