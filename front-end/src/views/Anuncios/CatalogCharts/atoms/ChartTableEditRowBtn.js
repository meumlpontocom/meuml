import React, { useContext }    from "react";
import Swal                     from "sweetalert2";
import NewRowForm               from "./NewRowForm";
import { CButton }              from "@coreui/react";
import { FaPencilAlt }          from "react-icons/fa";
import { toast }                from "react-toastify";
import { catalogChartsContext } from "../catalogChartsContext";
import withReactContent         from "sweetalert2-react-content";

const ChartTableEditRowBtn = () => {
  const { selectedRow, setSelectRow } = useContext(catalogChartsContext);

  async function editTableRow() {
    if (selectedRow.id && selectedRow.attributes) {
      const form = {};
      const ReactSwal = withReactContent(Swal);
      const { id, attributes } = selectedRow;

      const updateFormValue = ({ target }) => (form[target.id] = target.value);

      const popup = await ReactSwal.fire({
        title: "Nova linha",
        html: <NewRowForm attributes={attributes} form={form} updateFormValue={updateFormValue} />,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Salvar",
      });

      if (popup.value) {
        setSelectRow({
          id,
          attributes: attributes.map(attribute => ({ ...attribute, values: [{ name: form[attribute.id] }] })),
        });
      }
    } else {
      toast("Selecione uma linha para pode editar.", { type: toast.TYPE.WARNING });
    }
  }

  return (
    <CButton block color="info" onClick={editTableRow} disabled={!selectedRow.id}>
      <FaPencilAlt className="mb-1 mr-1" />
      &nbsp;Editar linha
    </CButton>
  );
};

export default ChartTableEditRowBtn;
