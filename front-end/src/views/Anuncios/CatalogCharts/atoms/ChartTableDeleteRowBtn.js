import React, { useContext }    from "react";
import { CButton }              from "@coreui/react";
import { FaPencilAlt }          from "react-icons/fa";
import { toast }                from "react-toastify";
import { catalogChartsContext } from "../catalogChartsContext";

const ChartTableDeleteRowBtn = () => {
  const { selectedRow, setSelectRow, catalogChartTableData, catalogCharts, setCharts } =
    useContext(catalogChartsContext);

  function removeTableRow() {
    const charts = catalogCharts[catalogChartTableData.type].charts;
    if (charts.length) {
      let error = 0;
      const selectedChartUpdated = charts.map(catalogChart => {
        if (catalogChart.id === catalogChartTableData.id) {
          if (catalogChart.rows.length > 1) {
            return {
              ...catalogChart,
              rows: catalogChart.rows.filter(row => row.id !== selectedRow.id),
            };
          } else error = 1;
        }
        return catalogChart;
      });

      if (error === 0) {
        setCharts({
          ...catalogCharts,
          [catalogChartTableData.type]: { charts: selectedChartUpdated },
        });
        setSelectRow({});
        toast("Linha removida.", { type: toast.TYPE.INFO });
      } else toast("A tabela precisa conter ao menos uma linha.", { type: toast.TYPE.WARNING });
    }
  }
  return (
    <CButton block color="danger" onClick={removeTableRow} disabled={!selectedRow.id}>
      <FaPencilAlt className="mb-1 mr-1" />
      &nbsp;Apagar linha
    </CButton>
  );
};

export default ChartTableDeleteRowBtn;
