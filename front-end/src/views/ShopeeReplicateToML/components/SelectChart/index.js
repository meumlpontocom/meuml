/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useMemo } from "react";
import BlackCard from "../BlackCard";
import { CCol } from "@coreui/react";
import { FaRulerCombined } from "react-icons/fa";
import SelectedChartTable from "../SelectedChartTable";
import SelectChartDropdown from "../SelectChartDropdown";
import shopeeMlReplicationContext from "../../shopeeReplicateToMLContext";

const SelectChart = () => {
  const { chartOptions } = useContext(shopeeMlReplicationContext);
  const { SPECIFIC, STANDARD, BRAND } = useMemo(() => chartOptions, [chartOptions]);
  const options = useMemo(
    () => (SPECIFIC && STANDARD && BRAND ? [...SPECIFIC.charts, ...STANDARD.charts, ...BRAND.charts] : []),
    [chartOptions],
  );
  return !options.length ? (
    <></>
  ) : (
    <CCol xs={12}>
      <BlackCard
        header={
          <>
            <h3>
              <FaRulerCombined />
              &nbsp; Tabelas de medidas
            </h3>
          </>
        }
        body={
          <>
            <CCol xs={12} className="text-info">
              <SelectChartDropdown options={options} />
            </CCol>
            <CCol xs={12}>
              <SelectedChartTable options={options} />
            </CCol>
          </>
        }
      />
    </CCol>
  );
};

export default SelectChart;
