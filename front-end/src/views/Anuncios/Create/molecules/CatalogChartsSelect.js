import React, { useCallback, useContext, useState } from "react";
import { CInputGroup, CSelect }                     from "@coreui/react";
import { FaTable }                                  from "react-icons/fa";
import { createMlAdvertContext }                    from "../createMlAdvertContext";
import CatalogChartAttributeAlert                   from "../atoms/CatalogChartAttributeAlert";
import ToggleShowSelectOptions                      from "../../CatalogCharts/atoms/ToggleShowSelectOptions";
import InputPrependToggleIconLoading                from "../../CatalogCharts/molecules/InputPrependToggleIconLoading";

const CatalogChartSelect = ({ showAttributesAlert }) => {
  const {
    setFormData,
    form: {
      catalogCharts: { BRAND, STANDARD, SPECIFIC },
      selectedChart,
    },
  } = useContext(createMlAdvertContext);

  const [isLoading, setIsLoading] = useState(() => false);
  const [showMoreData, setShowMoreData] = useState(() => 0);

  const setSelectChart = useCallback(value => setFormData({ id: "selectedChart", value }), [setFormData]);

  function loadMoreData() {
    setIsLoading(true);
    setTimeout(() => {
      setShowMoreData(current => current + 1);
      setIsLoading(false);
    }, 1500);
  }

  function handleChange({ target: { value } }) {
    if (value === "load-more-data") {
      loadMoreData();
      setSelectChart("");
    } else {
      setSelectChart(value);
    }
  }

  if (!showAttributesAlert) {
    return <CatalogChartAttributeAlert />;
  }

  return BRAND?.charts || STANDARD?.charts || SPECIFIC?.charts ? (
    <CInputGroup>
      <InputPrependToggleIconLoading isLoading={isLoading} Icon={<FaTable />} />
      <CSelect onChange={handleChange} value={selectedChart} disabled={isLoading}>
        <option value="">Selecione...</option>
        <ToggleShowSelectOptions show={true} options={BRAND?.charts || BRAND} />
        <ToggleShowSelectOptions show={showMoreData >= 1} options={STANDARD?.charts || STANDARD} />
        <ToggleShowSelectOptions show={showMoreData >= 2} options={SPECIFIC?.charts || SPECIFIC} />
        {showMoreData < 2 ? <option value="load-more-data">Carregar mais</option> : <></>}
      </CSelect>
    </CInputGroup>
  ) : (
    <></>
  );
};

export default CatalogChartSelect;
