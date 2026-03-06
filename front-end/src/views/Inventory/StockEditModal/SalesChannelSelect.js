import React from "react";
import { StyledPicky } from "../../../components/StyledPicky";

const SalesChannelSelect = ({ options, value, onChange }) => {
  return (
    <StyledPicky
      options={["Mercado Livre", "Shopee", "Loja própria"]} //TODO: change to real data
      open={false}
      labelKey="name"
      valueKey="id"
      multiple={false}
      placeholder="Selecione um canal de venda"
      keepOpen={false}
      value={value}
      onChange={onChange}
      renderList={({ items, selectValue, getIsSelected }) => {
        return (
          <ul className="p-0">
            {items.map((item, index) => {
              return (
                <li
                  key={index}
                  onClick={() => {
                    selectValue(item);
                  }}
                  className="d-flex"
                >
                  {getIsSelected(item) ? <strong>{item}</strong> : item}
                </li>
              );
            })}
          </ul>
        );
      }}
    />
  );
};

export default SalesChannelSelect;
