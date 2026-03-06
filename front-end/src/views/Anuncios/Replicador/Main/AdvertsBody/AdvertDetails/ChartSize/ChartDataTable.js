import React from "react";
import "./style.css";

const ChartDataTable = ({ id, rows, selectable = false, selected, setSelected }) => {
  return (
    <table id="table">
      <thead>
        <tr>
          <th>Site</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(rows).map(([site, name]) => (
          <tr
            key={site}
            className={selectable && selected === site ? "selected" : ""}
            onClick={() => selectable && setSelected({ site, id })}
          >
            <td>{site}</td>
            <td>{name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChartDataTable;
