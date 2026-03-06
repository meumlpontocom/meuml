import React, { useContext }     from "react";
import { CCol, CRow }            from "@coreui/react";
import { catalogChartsContext }  from "../catalogChartsContext";
import ChartTableHead            from "../atoms/ChartTableHead";
import ChartTableRows            from "../atoms/ChartTableRows";
import ChartTableAddRow          from "../atoms/ChartTableAddRowBtn";
import ChartTableEditRowBtn      from "../atoms/ChartTableEditRowBtn";
import ChartTableCustomRows      from "../atoms/ChartTableCustomRows";
import ChartTableDeleteRowBtn    from "../atoms/ChartTableDeleteRowBtn";
import AdvertLinkingInstructions from "../atoms/AdvertLinkingInstructions";

const ChartTable = () => {
  const { isLinkingAdverts } = useContext(catalogChartsContext);

  return (
    <>
      <AdvertLinkingInstructions />
      <table
        id="catalog-chart-table"
        name="catalog-chart-table"
        className="table table-secondary table-responsive"
      >
        <thead>
          <ChartTableHead />
        </thead>
        <tbody>
          <ChartTableRows />
          <ChartTableCustomRows />
        </tbody>
      </table>
      {!isLinkingAdverts && (
        <CRow>
          <CCol xs="12" sm="4">
            <ChartTableAddRow />
          </CCol>
          <CCol xs="12" sm="4">
            <ChartTableEditRowBtn />
          </CCol>
          <CCol xs="12" sm="4">
            <ChartTableDeleteRowBtn />
          </CCol>
        </CRow>
      )}
    </>
  );
};

export default ChartTable;
