import React from "react";
import { CRow, CCol } from "@coreui/react";
import { formatDate } from "./helpers";

import styled from "styled-components";

const ProductDetailCard = ({ warehouse, item }) => {
  return (
    <CRow>
      <CCol xs={12}>
        <StyledTable className="table table-light table-sm text-muted">
          <thead>
            <th className="warehouse-name"></th>
            <th className="batch-exp-date"></th>
            <th>Disponível</th>
            <th>Reservado</th>
            <th>Total</th>
            <th></th>
          </thead>
          <tbody>
            <tr className="warehouse-stock">
              <td>{warehouse.warehouse_name}</td>
              <td></td>
              <td>{warehouse.qtd_available}</td>
              <td>{warehouse.qtd_reserved}</td>
              <td>{warehouse.qtd_total}</td>
            </tr>
            {warehouse.warehouse_items?.length
              ? warehouse.warehouse_items.map((warehouseItem) => (
                  <tr key={warehouseItem.id}>
                    {item.has_expiration_date ? (
                      <>
                        <td></td>
                        <td className="exp-date">
                          {formatDate(warehouseItem.expiration_date)}
                        </td>
                        <td>{warehouseItem.qtd_available}</td>
                        <td>{warehouseItem.qtd_reserved}</td>
                        <td>{warehouseItem.qtd_total}</td>
                      </>
                    ) : null}
                  </tr>
                ))
              : null}
          </tbody>
        </StyledTable>
      </CCol>
    </CRow>
  );
};

const StyledTable = styled.table`
  font-size: 0.9rem;
  &:hover,
  &:focus {
    background-color: #f9fafb !important;
  }
  th,
  td {
    width: 5%;
  }

  .warehouse-name {
    width: 30%;
  }

  .warehouse-stock {
    font-weight: bold;
  }
`;

export default ProductDetailCard;
