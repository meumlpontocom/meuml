import React, { useCallback, useContext, useMemo } from "react";
import { CCard, CCardBody, CCol, CRow }   from "@coreui/react";
import CardHeader                         from "../atoms/CardHeader";
import CreateCustomChart                  from "./CreateCustomChart";
import { catalogChartsContext }           from "../catalogChartsContext";
import ChartTable                         from "../molecules/ChartTable";
import SelectedChartName                  from "../atoms/SelectedChartName";
import ChartAttributesTable               from "../molecules/ChartAttributesTable";

const CatalogChart = () => {
  const { selectedCatalogChart, catalogChartTableData } = useContext(catalogChartsContext);

  const sortedObjectToArrayConverter = useCallback(data => {
    return Object.keys(data).sort((a, b) => a < b);
  }, []);

  const createCustomChart = useMemo(() => selectedCatalogChart === "custom", [selectedCatalogChart]);

  return createCustomChart ? (
    <CreateCustomChart />
  ) : catalogChartTableData && Object.keys(catalogChartTableData).length  ? (
    <CCard>
      <CardHeader text="Tabela de medidas" />
      <CCardBody>
        <CRow>
          <CCol xs="12">
            <SelectedChartName />
          </CCol>
          <CCol xs="12">
            <h5>Atributos</h5>
            <ChartAttributesTable sortedObjectToArrayConverter={sortedObjectToArrayConverter} />
            <h5 className="mt-4">Tabela de medidas</h5>
            <ChartTable sortedObjectToArrayConverter={sortedObjectToArrayConverter} />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  ) : (
    <></>
  );
};

export default CatalogChart;
