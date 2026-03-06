import React, { useEffect, useState } from "react";
import { CListGroupItem, CBadge, CSpinner } from "@coreui/react";
import { StyledPicky } from "../../../components/StyledPicky";
import styled from "styled-components";

const GroupItemStyles = styled.div`
  --accent-color: ${({ platform }) =>
    platform === "ML" ? `#FFE500` : `#FF5200`};

  .list-group-item,
  .list-group-item-secondary,
  .list-group-item-accent-secondary {
    border-color: var(--accent-color);
  }

  .badge {
    margin-right: 10px;
    border: 1px solid #c4c9d0;
    color: #000;
    background-color: var(--accent-color);
  }
`;

const SingleAccount = ({
  account,
  warehouses,
  accountDefaultWarehouse,
  userWarehouseSettings,
  setUserWarehouseSettings,
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // this will become a API endpoint in the future
  const marketplaces = [
    {
      id: 1,
      name: "Mercado Livre",
      abbreviation: "ML",
    },
    {
      id: 2,
      name: "Shopee",
      abbreviation: "SP",
    },
    {
      id: 3,
      name: "Venda pessoal",
      abbreviation: "VP",
    },
    {
      id: 4,
      name: "Loja própria",
      abbreviation: "LP",
    },
  ];

  useEffect(() => {
    // const userDefaultWarehouse = warehouses.filter(
    //   ({ is_default }) => is_default === true
    // )[0];
    setSelectedWarehouse(accountDefaultWarehouse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouses]);

  return (
    <GroupItemStyles platform={account.platform}>
      <CListGroupItem
        accent="secondary"
        color="secondary"
        className="rounded mb-1 d-flex justify-content-between align-items-center"
      >
        <CBadge shape="pill">{account && account.platform}</CBadge>
        <div className="w-50 d-flex justify-content-between align-items-center">
          <strong className="mr-5">{account && account.name}</strong>
          {isPending && <CSpinner size="sm" className="mr-3" />}
        </div>
        <StyledPicky
          disabled={isPending}
          options={warehouses}
          open={false}
          labelKey="name"
          valueKey="id"
          multiple={false}
          placeholder="Selecione um armazém"
          keepOpen={false}
          value={selectedWarehouse}
          onChange={setSelectedWarehouse}
          renderList={({
            items,
            selected,
            multiple,
            selectValue,
            getIsSelected,
          }) => {
            return (
              <ul className="p-0">
                {items.map((item) => {
                  const label = `${item.name}`;
                  const code = `${item.code}`;
                  return (
                    <li
                      key={item.id}
                      onClick={() => {
                        selectValue(item);
                        setIsPending(true);
                        const marketplace = marketplaces.find(
                          ({ abbreviation }) =>
                            abbreviation === account.platform
                        );

                        const setting = {
                          account_name: account.name,
                          warehouse_id: item.id,
                          marketplace_id: marketplace.id,
                          account_id: account.id,
                        };

                        setUserWarehouseSettings([
                          // filter account already set with warehouse default to avoid duplicates
                          ...userWarehouseSettings.filter(
                            ({ account_id }) => account_id !== account.id
                          ),
                          setting,
                        ]);
                        setIsPending(false);
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
      </CListGroupItem>
    </GroupItemStyles>
  );
};

export default SingleAccount;
