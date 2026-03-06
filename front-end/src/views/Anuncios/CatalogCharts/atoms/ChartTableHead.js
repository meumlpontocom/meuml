import React, { useContext, useMemo } from "react";
import Th                             from "./Th";
import { catalogChartsContext }       from "../catalogChartsContext";
import { FaCheckSquare } from "react-icons/fa";

const ChartTableHead = () => {
  const { catalogChartTableData } = useContext(catalogChartsContext);

  const tableData = useMemo(() => {
    return catalogChartTableData.rows.reduce((previous, current) => {
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
  }, [catalogChartTableData.rows]);

  return (
    <tr>
      <Th id="select-row"><FaCheckSquare /></Th>
      {Object.values(tableData).map(({ id, name }) => {
        return (
          <Th
            id={id}
            key={id}
            style={{ backgroundColor: id === catalogChartTableData.main_attribute_id ? "#0055ff" : "" }}
          >
            {name}
          </Th>
        );
      })}
    </tr>
  );
};

export default ChartTableHead;
