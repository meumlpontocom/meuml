import React, { useState, useContext } from "react";
import { CCardBody, CDataTable, CCollapse, CButton } from "@coreui/react";
import NoRegisteredProductsWarning from "../../components/Warnings/NoRegisteredProductsWarning";
import styled from "styled-components";
import { InventoryContext } from "./InventoryContext";
import Pagination from "./Pagination";
import TableFilters from "./TableFilters";
import Loading from "react-loading";
import { RegisterSKU } from "./RegisterSku";
import ProductVariations from "./ProductVariations";
import ProductDetails from "./ProductDetails";

const ProductsList = () => {
  const [details, setDetails] = useState({});

  const {
    products,
    isPending,
    addModal,
    setAddModal,
    setProductToEditStock,
    setMode,
  } = useContext(InventoryContext);

  const toggleAddModal = () => {
    setAddModal(!addModal);
  };

  const toggleDetails = (id) =>
    setDetails((previous) => ({ ...previous, [id]: !details[id] }));

  const fields = [
    {
      key: "sku",
      label: "SKU",
      _classes: "table-sku",
      _style: { width: "20%" },
    },
    { key: "name", label: "Nome" },
    {
      key: "qty_in_stock",
      label: "Estoque",
      _style: { width: "20%" },
    },
    {
      key: "table_buttons",
      label: "",
      _style: { width: "1%" },
      sorter: false,
      filter: false,
    },
  ];

  return (
    <CDataTableStyles>
      {products && (
        <CDataTable
          overTableSlot={<TableFilters />}
          underTableSlot={
            <TableFooter isPending={isPending} setDetails={setDetails} />
          }
          responsive
          items={products}
          fields={fields}
          hover={products.length > 0}
          noItemsViewSlot={<NoRegisteredProductsWarning />}
          scopedSlots={{
            sku: (item) => {
              return (
                <td className={`table-sku ${details[item.id] ? "open" : ""}`}>
                  {item.sku || <RegisterSKU item={item} />}
                </td>
              );
            },
            name: (item) => {
              return (
                <td className={`${details[item.id] ? "open" : ""}`}>
                  {item.name}
                </td>
              );
            },
            qty_in_stock: (item) => {
              return (
                <td className={`${details[item.id] ? "open" : ""}`}>
                  {item.qty_in_stock}
                </td>
              );
            },
            table_buttons: (item, index) => {
              return (
                <td className={`${details[item.id] ? "open" : ""}`}>
                  <div className="table-buttons">
                    <CButton
                      disabled={
                        isPending || item.is_parent || item.qty_in_stock < 1
                      }
                      color="dark"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDetails(item.id)}
                    >
                      {details[item.id] && !item.is_parent
                        ? "Ocultar"
                        : "Detalhes"}
                    </CButton>
                    <CButton
                      disabled={isPending || item.is_parent}
                      color="primary"
                      variant="outline"
                      size="sm"
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => {
                        setProductToEditStock(item);
                        setMode("add");
                        toggleAddModal();
                      }}
                    >
                      Entrada
                      <i className="cil-plus ml-1" />
                    </CButton>
                    <CButton
                      disabled={
                        isPending || (item.qty_available < 1 && !item.is_parent)
                      }
                      color={"primary"}
                      variant={item.is_parent ? null : "outline"}
                      size="sm"
                      className="d-flex align-items-center justify-content-center"
                      onClick={() => {
                        if (item.is_parent) {
                          toggleDetails(item.id);
                        } else {
                          setProductToEditStock(item);
                          setMode("subtract");
                          toggleAddModal();
                        }
                      }}
                    >
                      {item.is_parent ? (
                        <>
                          {details[item.id] ? (
                            <span>Ocultar</span>
                          ) : (
                            <span>Variações</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Saída</span>
                          <i className="cil-minus ml-1" />
                        </>
                      )}
                    </CButton>
                  </div>
                </td>
              );
            },
            details: (item) => {
              return (
                <CCollapse show={details[item.id]}>
                  <CCardBody>
                    {item.is_parent ? (
                      <ProductVariations
                        item={item}
                        parentDetails={details}
                        isOpen={details[item.id]}
                        setProductListDetails={setDetails}
                        shouldFetchStock={
                          item.qty_in_stock > 0 || item.is_parent
                        }
                      />
                    ) : (
                      <ProductDetails
                        item={item}
                        isOpen={details[item.id]}
                        setDetails={setDetails}
                        shouldFetchStock={item.qty_in_stock > 0}
                      />
                    )}
                  </CCardBody>
                </CCollapse>
              );
            },
          }}
        />
      )}
    </CDataTableStyles>
  );
};

const CDataTableStyles = styled.div`
  label {
    font-size: 1.25rem;
    margin: 20px 0 25px 0;
  }

  a {
    text-decoration: none;
  }

  .table-sku {
    min-width: 80px;
    word-wrap: break-word;
    word-break: break-all;
  }

  .table-buttons {
    border-top: 0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    button {
      min-width: 75px;
      text-align: center;
    }

    button:disabled {
      cursor: not-allowed;
    }

    @media (max-width: 1024px) {
      flex-direction: column;
    }
  }

  .form-control {
    width: 80%;
    margin: 20px 0 25px 0;
  }

  .open {
    background-color: #321fdb;
    font-weight: bold;
    color: #fff;

    button {
      color: #fff;
      border-color: #fff;

      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }

      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.3);
      }
    }
  }

  .collapse.show {
    border: 2px solid #321fdb;
    margin-top: -2px;
  }

  .card-body {
    background-color: #d9d7eb;
  }
`;

const Overlay = styled.div`
  inset: 47px 0px 16px;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
`;

const LoadingBars = styled(Loading)`
  z-index: 1;
  margin-left: 24px;
`;

const TableFooterStyles = styled.div`
  display: flex;
  align-items: center;
  ul {
    margin-bottom: 0;
  }
`;

const LoadingData = () => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <LoadingBars type="bars" color={"#3322D7"} height={30} width={30} />
      <Overlay />
    </div>
  );
};

const TableFooter = ({ isPending, setDetails }) => {
  return (
    <TableFooterStyles>
      <Pagination setDetails={setDetails} />
      {isPending && <LoadingData />}
    </TableFooterStyles>
  );
};

export default ProductsList;
