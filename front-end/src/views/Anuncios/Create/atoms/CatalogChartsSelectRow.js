import React, { useContext, useMemo } from "react";
import { FaCheckCircle }              from "react-icons/fa";
import styled                         from "styled-components";
import { createMlAdvertContext }      from "../createMlAdvertContext";

const CatalogChartsSelectRow = () => {
  const {
    setFormData,
    form: { selectedChart, selectedChartRow, catalogCharts },
  } = useContext(createMlAdvertContext);

  const chart = useMemo(() => {
    const getFullChartList = chartType =>
      catalogCharts[chartType]?.charts?.length ? Object.values(catalogCharts[chartType].charts) : [];
    const charts = [
      ...getFullChartList("BRAND"),
      ...getFullChartList("SPECIFIC"),
      ...getFullChartList("STANDARD"),
    ];
    const selected = charts.filter(chart => chart.id === selectedChart)[0] || null;

    return selected ?? { rows: [] };
  }, [catalogCharts, selectedChart]);

  const tableHeaders = useMemo(() => {
    return chart.rows.reduce((previous, current) => {
      const dictionary = { ...previous };
      current.attributes.forEach(attribute => {
        if (dictionary[attribute.id]) {
          dictionary[attribute.id] = {
            ...attribute,
            values: [...attribute.values, ...dictionary[attribute.id].values],
          };
        } else {
          dictionary[attribute.id] = {
            ...attribute,
            values: [...attribute.values],
          };
        }
      });
      return dictionary;
    }, {});
  }, [chart.rows]);

  const Data = ({ values }) =>
    values.map((value, index) => (
      <span key={value.id} style={{ fontWeight: 200 }}>
        {value.name}
        {index + 1 < values.length ? ", " : ""}
      </span>
    ));

    const Title = styled.h5`
      text-align: center;
      margin: 0px;
      height: 35px;
      color: white;
      background-color: #39f;
    `;

  function handleSelectRow(id) {
    setFormData({ id: "selectedChartRow", value: id });
  }

  return chart.rows.length ? (
    <>
      <Title className="mt-5">Selecionar medidas do produto</Title>
      <table id="select-chart-row" name="select-chart-row" className="table table-secondary table-responsive border-info">
        <thead>
          <tr>
            <th><FaCheckCircle /></th>
            {Object.values(tableHeaders).map(({ id, name }) => (
              <th key={id} id={id} name={name}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {chart.rows.map(row => (
            <tr id={row.id} name={`${chart.names.MLB}-line-${row.id.split(":")[1]}`} key={row.id}>
              <td>
                <input type="radio" checked={selectedChartRow === row.id} onClick={() => handleSelectRow(row.id)} />
              </td>
              {row.attributes.map(({ id, name, values }) => (
                <td id={id} name={name} key={id}>
                  <Data values={values} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : (
    <></>
  );
};

export default CatalogChartsSelectRow;
