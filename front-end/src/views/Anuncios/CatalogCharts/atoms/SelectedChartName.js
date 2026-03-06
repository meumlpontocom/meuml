import React, { useContext }    from "react";
import Input                    from "./Input";
import { CLabel }               from "@coreui/react";
import { FaPencilAlt }          from "react-icons/fa";
import { catalogChartsContext } from "../catalogChartsContext";

const SelectedChartName = () => {
  const { catalogChartTableData, setChartName, catalogChartName } = useContext(catalogChartsContext);

  function handleChange({ target }) {
    setChartName(target.value);
  }

  return (
    <div className="mb-4">
      <CLabel htmlFor="catalog-chart-custom-name">Nome da tabela</CLabel>
      <Input
        prepend={<FaPencilAlt />}
        onChange={handleChange}
        value={catalogChartName}
        id="catalog-chart-custom-name"
        name="catalog-chart-custom-name"
        placeholder={catalogChartTableData?.names?.MLB}
      />
    </div>
  );
};

export default SelectedChartName;
