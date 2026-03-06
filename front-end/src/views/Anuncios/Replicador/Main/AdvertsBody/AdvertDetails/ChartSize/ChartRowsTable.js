import React from "react";
import "./style.css";

const ChartRowsTable = ({ charts, selected, setSelected }) => {
  return charts.map(chart => {
    return (
      <div key={chart.id} className="chart-container mt-1">
        <table id="table">
          <thead>
            <tr>
              <th
                style={{ padding: "12px", background: "white", textAlign: "center" }}
                colSpan={chart.rows[0].attributes.length}
              >
                {chart.names[chart.site_id]}
              </th>
            </tr>
          </thead>
          <thead>
            <tr>
              {chart.rows[0].attributes.map(attribute => (
                <th key={attribute.id}>{attribute.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.names.map(row => (
              <tr
                key={row.id}
                className={selected?.rowId === row.id && selected?.chartId === chart.id ? "selected" : ""}
                onClick={() => setSelected({ rowId: row.id, chartId: chart.id })}
              >
                {row.attributes.map(attribute => (
                  <td key={attribute.id}>
                    {attribute.values.map(value =>
                      value.struct ? `${value.struct.number} ${value.struct.unit}` : value.name,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  });
};

export default ChartRowsTable;
