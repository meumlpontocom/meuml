import React, { useState, useEffect, useContext } from "react";
import { CDataTable, CButton, CCollapse, CCardBody } from "@coreui/react";
import LoadingCardData from "../../components/LoadingCardData";
import { getProductVariations } from "./inventoryRequests";
import styled from "styled-components";
import { RegisterSKU } from "./RegisterSku";
import { InventoryContext } from "./InventoryContext";
import ProductDetails from "./ProductDetails";

const fields = [
  {
    key: "sku",
    label: "SKU",
    _classes: "table-sku",
    _style: { width: "20%" },
  },
  { key: "name", label: "Nome" },
  {
    key: "qtd_total",
    label: "Estoque",
    _style: { width: "19%" },
  },
  {
    key: "table_buttons",
    label: "",
    _style: { width: "1%" },
    sorter: false,
    filter: false,
  },
];

const ProductVariations = ({ item, setProductListDetails, shouldFetchStock, isOpen }) => {
  const { addModal, setAddModal, setProductToEditStock, setMode } = useContext(InventoryContext);
  const [isPending, setIsPending] = useState(true);
  const [productVariations, setProductVariations] = useState([]);
  const [variationDetails, setDetails] = useState([]);

  const toggleAddModal = () => {
    setAddModal(!addModal);
  };

  const toggleDetails = id => setDetails(previous => ({ ...previous, [id]: !variationDetails[id] }));

  useEffect(() => {
    if (item && shouldFetchStock && isOpen) {
      async function getVariations() {
        const variations = await getProductVariations(item.id).then(res => res.data?.data.variations);
        variations && setProductVariations(variations);
        setIsPending(false);
      }
      getVariations();
    }

    // return setDetails({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, setProductListDetails, shouldFetchStock, isOpen]);

  if (isPending) return <LoadingCardData color="#321fdb" />;
  if (!productVariations) return null;
  return (
    <CDataTableStyles>
      <CDataTable
        items={productVariations}
        fields={fields}
        responsive
        scopedSlots={{
          sku: item => {
            return (
              <td className={`table-sku ${variationDetails[item.id] ? "open" : ""}`}>
                {item.sku || <RegisterSKU item={item} />}
              </td>
            );
          },
          name: item => {
            return <td className={`${variationDetails[item.id] ? "open" : ""}`}>{item.name}</td>;
          },
          qtd_total: item => {
            return <td className={`${variationDetails[item.id] ? "open" : ""}`}>{item.qtd_total}</td>;
          },
          table_buttons: item => {
            return (
              <td className={`${variationDetails[item.id] ? "open" : ""}`}>
                <div className="table-buttons">
                  <CButton
                    disabled={isPending || item.qtd_total < 1}
                    color="dark"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleDetails(item.id);
                    }}
                  >
                    {variationDetails[item.id] ? "Ocultar" : "Detalhes"}
                  </CButton>
                  <CButton
                    disabled={isPending}
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
                    disabled={isPending || item.qtd_total < 1}
                    color="primary"
                    variant={item.is_parent ? null : "outline"}
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => {
                      setProductToEditStock(item);
                      setMode("subtract");
                      toggleAddModal();
                    }}
                  >
                    <>
                      <span>Saída</span>
                      <i className="cil-minus ml-1" />
                    </>
                  </CButton>
                </div>
              </td>
            );
          },
          details: item => {
            return (
              <CCollapse show={variationDetails[item.id]}>
                <CCardBody>
                  <ProductDetails
                    item={item}
                    isOpen={variationDetails[item.id]}
                    setDetails={setDetails}
                    shouldFetchStock={true}
                  />
                </CCardBody>
              </CCollapse>
            );
          },
        }}
      />
    </CDataTableStyles>
  );
};

const CDataTableStyles = styled.div`
  margin-top: -20px;
  font-size: 0.9rem;

  label {
    font-size: 1.25rem;
    margin: 20px 0 25px 0;
  }
  a {
    text-decoration: none;
  }
  thead {
    color: #768192;
    font-size: 0.8rem;
    tr > * {
      border: none !important;
    }
    tr:hover {
      color: #768192;
      background-color: unset;
    }
  }
  thead:focus,
  thead:hover {
    color: #768192;
    background-color: unset;
  }
  tbody {
    background-color: #ececee;
    font-size: 0.9em;
  }
  td {
    border-bottom: none;
  }
  tr > * {
    padding: 6px 12px;
  }
  .table-sku {
    word-wrap: break-word;
    word-break: break-all;
  }
  .qty_in_stock {
    min-width: 80%;
  }
  .table-buttons {
    border-top: 0;
    display: flex;
    gap: 10px;
    button {
      min-width: 70px;
      font-size: 0.9em;
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
    background-color: hsl(246, 75%, 35%) !important;
  }

  .collapse.show {
    border: 2px solid hsl(246, 75%, 35%) !important;
    margin-top: -2px;
  }

  .card-body {
    background-color: hsl(246, 75%, 85%) !important;
  }
`;

export default ProductVariations;
