import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  CInputGroup,
  CInput,
  CButton,
  CInputGroupAppend,
  CSpinner,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { StyledPicky } from "../../components/StyledPicky";
import { InventoryContext } from "./InventoryContext";
import styled from "styled-components";

const TableFiltersStyles = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 16px;

  .btn .c-icon,
  .btn i {
    margin: 0;
  }

  .input-group-prepend {
    max-height: 40px;
  }
`;

const StyledCIcon = styled(CIcon)`
  margin: 0;
`;

const orderOptions = [
  {
    id: 1,
    sortName: "name",
    displayName: "Nome de A - Z",
    sortOrder: "asc",
  },
  {
    id: 2,
    sortName: "name",
    displayName: "Nome de Z - A",
    sortOrder: "desc",
  },
  {
    id: 3,
    sortName: "qtd_total",
    displayName: "Estoque Maior",
    sortOrder: "desc",
  },
  {
    id: 4,
    sortName: "qtd_total",
    displayName: "Estoque Menor",
    sortOrder: "asc",
  },
  {
    id: 5,
    sortName: "sku",
    displayName: "SKU de A - Z",
    sortOrder: "asc",
  },
  {
    id: 6,
    sortName: "sku",
    displayName: "SKU de Z - A",
    sortOrder: "desc",
  },
];

const TableFilters = () => {
  const { getProducts, setIsPending } = useContext(InventoryContext);
  const [filterString, setFilterString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSortingOption, setSelectedSortingOption] = useState(null);

  async function handleSearch() {
    setIsSearching(true);
    await getProducts(filterString, undefined, selectedSortingOption);
    setIsSearching(false);
  }

  const sortProductsList = useCallback(
    async function () {
      setIsPending(true);
      await getProducts(filterString, undefined, selectedSortingOption);
      setIsPending(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSortingOption]
  );

  useEffect(() => {
    selectedSortingOption && sortProductsList();
  }, [selectedSortingOption, sortProductsList]);

  return (
    <TableFiltersStyles>
      <form className="input-group">
        <CInputGroup className="d-flex flex-nowrap">
          <CInput
            className="m-0 h-100"
            type="text"
            id="product"
            name="product"
            placeholder="Buscar produtos"
            value={filterString}
            onChange={(e) => setFilterString(e.target.value)}
          />
          <CInputGroupAppend>
            <CButton
              disabled={isSearching}
              color="primary"
              className="d-flex align-items-center"
              onClick={handleSearch}
              type="submit"
            >
              {!isSearching && (
                <StyledCIcon name="cilSearch" className="mr-2" />
              )}
              {isSearching && <CSpinner size="sm" className="mr-2" />}
              Pesquisar
            </CButton>
          </CInputGroupAppend>
        </CInputGroup>
      </form>

      <StyledPicky
        labelKey="displayName"
        valueKey="id"
        options={orderOptions}
        placeholder={"Ordernar por"}
        value={selectedSortingOption}
        onChange={setSelectedSortingOption}
        keepOpen={false}
        renderList={({ items, selectValue, getIsSelected }) => {
          return (
            <ul className="p-0">
              {items.map((option) => {
                return (
                  <li
                    key={option.id}
                    onClick={() => {
                      selectValue(option);
                    }}
                    className="d-flex"
                  >
                    {getIsSelected(option) ? (
                      <strong>{option.displayName}</strong>
                    ) : (
                      option.displayName
                    )}
                  </li>
                );
              })}
            </ul>
          );
        }}
      />
    </TableFiltersStyles>
  );
};

export default TableFilters;
