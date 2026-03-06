import React from "react";
import { StyledPicky } from "../../../components/StyledPicky";

const AddProductWarehouseSelect = ({ options, value, onChange }) => {
  if (!options) return null;
  return (
    <StyledPicky
      options={options}
      open={false}
      labelKey="name"
      valueKey="id"
      multiple={false}
      placeholder="Selecione um armazém"
      keepOpen={false}
      value={value}
      onChange={onChange}
      renderList={({ items, selectValue, getIsSelected }) => {
        return (
          <ul className="p-0">
            {items.map((item) => {
              const label = `${item.name}`;
              const code = `${item.code}`;
              const id = `${item.id}`;
              return (
                <li
                  key={id}
                  onClick={() => {
                    selectValue(item);
                  }}
                  className="d-flex"
                >
                  <div className="w-25">
                    {getIsSelected(item) ? <strong>{code}</strong> : code}
                  </div>
                  {getIsSelected(item) ? <strong>{label}</strong> : label}
                </li>
              );
            })}
          </ul>
        );
      }}
    />
  );
};

export default AddProductWarehouseSelect;
