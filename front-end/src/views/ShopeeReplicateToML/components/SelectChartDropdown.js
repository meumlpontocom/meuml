import React, { useCallback, useContext } from "react";
import { CLabel, CSelect }                from "@coreui/react";
import shopeeMlReplicationContext         from "../shopeeReplicateToMLContext";

const SelectChartDropdown = ({ options }) => {
  const { setSelectedChartOptions } = useContext(shopeeMlReplicationContext);
  const handleChange = useCallback(
    ({ target }) => setSelectedChartOptions(target.value),
    [setSelectedChartOptions],
  );
  return (
    <>
      <CLabel htmlFor="select-chart-dropdown">
        <strong>Selecione uma tabela de medidas</strong>
      </CLabel>
      <CSelect id="select-chart-dropdown" onChange={handleChange}>
        <option value="">Selecione ...</option>
        {options.map((chartOption) => (
          <option key={chartOption.id} value={chartOption.id}>
            {chartOption.names.MLB}
          </option>
        ))}
      </CSelect>
    </>
  );
};

export default SelectChartDropdown;
