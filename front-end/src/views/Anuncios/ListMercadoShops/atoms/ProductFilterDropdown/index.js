/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Picky } from "react-picky";

export function ProductFilterDropdown({
  options,
  placeholder,
  multipleSelection,
  handleChange,
  resetSelected,
  includeFilter,
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    handleChange(selected);
  }, [selected]);

  useEffect(() => {
    setSelected([]);
  }, [resetSelected]);

  return (
    <Picky
      onChange={selected => setSelected(selected)}
      value={selected}
      options={options}
      open={false}
      multiple={multipleSelection}
      labelKey="label"
      valueKey="value"
      includeFilter={includeFilter}
      dropdownHeight={600}
      includeSelectAll={true}
      placeholder={placeholder}
      selectAllText="Selecionar Todos"
      filterPlaceholder="Filtrar por..."
      allSelectedPlaceholder="Todos (%s)"
      manySelectedPlaceholder="%s Selecionados"
    />
  );
}

export function SimpleProductFilterDropdown({
  options,
  placeholder,
  multipleSelection,
  handleChange,
  resetSelected,
  includeFilter,
}) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    handleChange(selected);
  }, [selected]);

  useEffect(() => {
    setSelected([]);
  }, [resetSelected]);

  return (
    <Picky
      value={selected}
      options={options}
      open={false}
      keepOpen={false}
      multiple={multipleSelection}
      labelKey="label"
      valueKey="value"
      includeFilter={includeFilter}
      dropdownHeight={600}
      includeSelectAll={true}
      placeholder={placeholder}
      selectAllText="Selecionar Todos"
      filterPlaceholder="Filtrar por..."
      allSelectedPlaceholder="Todos (%s)"
      manySelectedPlaceholder="%s Selecionados"
      render={({ style, isSelected, item, selectValue, labelKey, valueKey, multiple }) => {
        return (
          <li
            style={{ alignItems: "flex-start", justifyContent: "center", fontSize: 12 }}
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
