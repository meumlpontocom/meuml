import React     from "react";
import { Picky } from "react-picky";

export default function CatalogFilter({ catalogFilter, options, setSelected }) {
  return (
    <Picky
      value={catalogFilter}
      options={options}
      open={false}
      keepOpen={false}
      multiple={false}
      labelKey="label"
      valueKey="value"
      includeFilter={false}
      dropdownHeight={600}
      includeSelectAll={true}
      placeholder="Filtrar por ..."
      render={({ isSelected, item, labelKey, valueKey }) => {
        return (
          <li
            style={{
              alignItems: "flex-start",
              justifyContent: "center",
              fontSize: 12,
            }}
            className={isSelected ? "selected" : ""}
            key={item[valueKey]}
            onClick={() => setSelected(item)}
          >
            <input type="radio" checked={isSelected} readOnly hidden />
            <span style={{ fontSize: "12px" }}>{item[labelKey]}</span>
          </li>
        );
      }}
    />
  );
}
