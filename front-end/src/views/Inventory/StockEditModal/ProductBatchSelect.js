import React from "react";
import { StyledPicky } from "../../../components/StyledPicky";
import { formatDate } from "../helpers";

const ProductBatchSelect = ({ options, value, onChange }) => {
  return (
    <StyledPicky
      options={options?.sort(
        (a, b) => new Date(a.expiration_date) - new Date(b.expiration_date)
      )}
      open={false}
      labelKey="expiration_date"
      valueKey="id"
      multiple={false}
      placeholder="Selecione um lote do produto"
      keepOpen={false}
      value={value}
      onChange={onChange}
      renderList={({ items, selectValue, getIsSelected }) => {
        return (
          <ul className="p-0">
            {items.map((item) => (
              <BatchList
                key={item.id}
                item={item}
                selectValue={selectValue}
                getIsSelected={getIsSelected}
              />
            ))}
          </ul>
        );
      }}
    />
  );
};

const BatchList = ({ item, selectValue, getIsSelected }) => {
  const expDate = `${item.expiration_date}`;
  const totalQty = `${item.qtd_total}`;
  return (
    <li
      key={item.id}
      onClick={() => {
        selectValue(item);
      }}
      className="d-flex align-items-center"
    >
      <div className="w-50">
        {getIsSelected(item) ? (
          <>
            <strong>
              <em className="rounded bg-gradient-light px-2 py-1">
                Data de Validade:{" "}
              </em>
              <span className="ml-2">{formatDate(expDate)}</span>
            </strong>
          </>
        ) : (
          <>
            <em className="rounded bg-gradient-light px-2 py-1">
              Data de Validade:{" "}
            </em>
            <span className="ml-2">{formatDate(expDate)}</span>
          </>
        )}
      </div>
      {getIsSelected(item) ? (
        <>
          <strong>
            <em className="rounded bg-gradient-light px-2 py-1">Estoque: </em>
            <span className="ml-2">{totalQty}</span>
          </strong>
        </>
      ) : (
        <>
          <em className="rounded bg-gradient-light px-2 py-1">Estoque: </em>
          <span className="ml-2">{totalQty}</span>
        </>
      )}
    </li>
  );
};

export default ProductBatchSelect;
