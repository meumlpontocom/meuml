import React, { useContext }    from "react";
import { v4 as uuidv4 }         from "uuid";
import Swal                     from "sweetalert2";
import NewRowForm               from "./NewRowForm";
import { CButton }              from "@coreui/react";
import { FaPlusCircle }         from "react-icons/fa";
import withReactContent         from "sweetalert2-react-content";
import { catalogChartsContext } from "../catalogChartsContext";

const ChartTableAddRow = () => {
  const { customRows, setNewChartRows, catalogChartTableData } = useContext(catalogChartsContext);

  async function addTableRow() {
    const form = {};
    const ReactSwal = withReactContent(Swal);
    const { attributes } = catalogChartTableData.rows[0];

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
      setNewChartRows([
        ...customRows,
        {
          id: uuidv4(),
          attributes: attributes.map(attribute => ({
            ...attribute,
            values: [{ name: form[attribute.id] }],
          })),
        },
      ]);
    }
  }
  return (
    <CButton block color="light" onClick={addTableRow}>
      <FaPlusCircle className="mb-1 mr-1" />
      &nbsp;Nova linha
    </CButton>
  );
};

export default ChartTableAddRow;
