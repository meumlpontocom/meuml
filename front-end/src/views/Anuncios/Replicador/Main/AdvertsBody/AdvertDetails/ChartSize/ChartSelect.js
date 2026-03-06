import React, { useMemo } from "react";
import { Picky } from "react-picky";

const ChartSelect = ({ charts, onSelect, selected, placeholder }) => {
  const chartsOptions = useMemo(
    () => charts.map(item => ({ value: item.id, label: item.names[item.site_id ?? "MLB"] })),
    [charts],
  );

  return (
    <Picky
      value={selected}
      placeholder={placeholder}
      onChange={onSelect}
      multiple={false}
      includeFilter={false}
      options={chartsOptions}
      valueKey="value"
      labelKey="label"
      id="account-select"
      name="account-select"
      dropdownHeight={300}
    />
  );
};

export default ChartSelect;
