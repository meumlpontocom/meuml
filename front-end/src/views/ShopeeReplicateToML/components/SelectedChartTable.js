import React, { useContext, useMemo } from "react";
import { FaCheckCircle } from "react-icons/fa";
import shopeeMlReplicationContext from "../shopeeReplicateToMLContext";

const SelectedChartTable = ({ options = [] }) => {
  const { selectedChartOptions } =
    useContext(shopeeMlReplicationContext);

  const selectedChart = useMemo(
    () => options.find(({ id }) => id === selectedChartOptions),
    [options, selectedChartOptions],
  );
  const tableHeaders = useMemo(() => {
    if (selectedChart?.rows) {
      const attributeIdList = selectedChart.rows.reduce((previous, { attributes }) => {
        let mutation = { ...previous };
        attributes.forEach(({ id }) => {
          mutation[id] = true;
        });
        return mutation;
      }, {});
      return Object.keys(attributeIdList);
    }
    return [];
  }, [selectedChart]);

  // const handleSelectTableRow = useCallback(
  //   ({ target }) => {
  //     setSelectedChartRow(target.value);
  //   },
  //   [setSelectedChartRow],
  // );

  return !selectedChart?.id ? (
    <></>
  ) : (
    <>
      <h4 className="mt-4">
        {selectedChart.names.MLB}&nbsp;
        <small>({selectedChart.main_attribute_id})</small>
      </h4>
      <p className="text-info">
        <strong>Dados da tabela selecionada:</strong>
      </p>
      <table className="table table-responsive table-secondary">
        <thead>
          <tr>
            <th>
              <FaCheckCircle />
            </th>
            {tableHeaders.map(tableHeader => (
              <th key={tableHeader.id}>{tableHeader}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selectedChart.rows.map(line => (
            <tr>
              {/* <td key={line.id}>
              <input
                id={line.id}
                type="radio"
                name="line"
                value={line.id}
                checked={selectedChartRow === line.id}
                onChange={handleSelectTableRow}
              />
            </td> */}
              {line.attributes.map(({ values }) => (
                <td key={values[0].id}>{values[0].name}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SelectedChartTable;
