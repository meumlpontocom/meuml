import React, { useContext, useMemo } from "react";
import PropTypes                      from "prop-types";
import ChartTableHead                 from "../atoms/ChartAttributesTableHead";
import ChartTableBody                 from "../atoms/ChartAttributesTableBody";
import { catalogChartsContext }       from "../catalogChartsContext";

const ChartAttributesTable = ({ sortedObjectToArrayConverter }) => {
  const { catalogChartTableData } = useContext(catalogChartsContext);

  const attributesDataTable = useMemo(() => {
    return catalogChartTableData.attributes.reduce((previous, current, index) => {
      return {
        ...previous,
        [index]: current,
      };
    }, {});
  }, [catalogChartTableData.attributes]);

  return (
    <table
    id="attributes-table"
    name="attributes-table"
    className="table table-secondary table-responsive"
    >
      <ChartTableHead data={attributesDataTable} objectConverter={sortedObjectToArrayConverter} />
      <ChartTableBody data={attributesDataTable} objectConverter={sortedObjectToArrayConverter} />
    </table>
  );
};

ChartAttributesTable.propTypes = {
  sortedObjectToArrayConverter: PropTypes.func.isRequired
} 

export default ChartAttributesTable;
