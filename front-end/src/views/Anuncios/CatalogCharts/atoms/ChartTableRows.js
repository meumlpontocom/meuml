import React, { useContext }    from "react";
import Td                       from "./Td";
import Swal                     from "sweetalert2";
import { catalogChartsContext } from "../catalogChartsContext";

const ChartTableRows = () => {
  const { catalogChartTableData, setSelectRow, selectedRow } = useContext(catalogChartsContext);

  async function handleChange({ id, attributes }) {
    if (selectedRow.id && selectedRow.attributes?.length) {
      const { value } = await Swal.fire({
        title: "Atenção!",
        text: "Você só pode editar uma linha por vez na tabela. Deseja limpar as edições anteriores e fazer uma nova?",
        type: "question",
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Limpar"
      });
      if (value) setSelectRow({ id, attributes });
    } else setSelectRow({ id, attributes });
  }

  const Data = ({ values }) =>
    values.map((value, index) => (
      <span key={value.id} style={{ fontWeight: 200 }}>
        {value.name}
        {index + 1 < values.length ? ", " : ""}
      </span>
    ));

  return catalogChartTableData.rows.map(row => {
    return (
      <tr key={row.id}>
        <Td>
          <input
            type="checkbox"
            id={row.id}
            checked={selectedRow?.id === row.id}
            onChange={() => handleChange({ id: row.id, attributes: row.attributes })}
          />
        </Td>
        {row.attributes.map(({ id, name, values }) => {
          const edited = row.id === selectedRow.id && selectedRow.attributes.length;
          const editedAttribute = edited && selectedRow.attributes.find(attribute => attribute.id === id);
          return (
            <Td id={id} name={name} key={id}>
              {!edited && <Data values={values} />}
              {edited && <Data values={editedAttribute.values} />}
            </Td>
          );
        })}
      </tr>
    );
  });
};

export default ChartTableRows;
