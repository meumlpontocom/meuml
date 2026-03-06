import React, { useMemo } from "react";
import Main from "./Main";
import FetchingInformation from "./FetchingInformation";
import useMlCharts from "../../hooks/useMlCharts";

const ChartsRequiredAttributes = () => {
  const [isLoadingChartsRequiredAttributes, chartRequiredAttributes] = useMlCharts();
  const shouldUseCharts = useMemo(() => chartRequiredAttributes?.length, [chartRequiredAttributes]);
  return isLoadingChartsRequiredAttributes ? (
    <FetchingInformation />
  ) : !shouldUseCharts ? (
    <></>
  ) : (
    <Main requiredAttributes={chartRequiredAttributes} />
  );
};

export default ChartsRequiredAttributes;
