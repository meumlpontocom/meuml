import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CInputGroup,
} from "@coreui/react";
import ProductNameHeader from "./ProductNameHeader";
import WarehouseStockDisplay from "./WarehouseStockDisplay";
import UpdateStockInput from "./UpdateStockInput";
import TotalStockDisplay from "./TotalStockDisplay";
import ExpirationDateInput from "./ExpirationDateInput";
import GenerateCodeInput from "./GenerateCodeInput";
import LoadingCardData from "../../../components/LoadingCardData";
import WarehouseSelect from "./WarehouseSelect";
import SalesChannelSelect from "./SalesChannelSelect";
import ProductBatchSelect from "./ProductBatchSelect";
import NoRegisteredWarehousesWarning from "../../../components/Warnings/NoRegisteredWarehousesWarning";
import ModalStyles from "./ModalStyles";
import {
  stockIncrease,
  stockDecrease,
  getProductWarehouseStock,
  getWarehousesContainingProduct,
  handleError,
} from "../inventoryRequests";
import { formatDate } from "../helpers";
import { InventoryContext } from "../InventoryContext";
import ProductPriceInput from "./ProductPriceInput";

const StockEditModal = () => {
  const {
    setIsLoading,
    warehouses,
    addModal,
    setAddModal,
    productToEditStock,
    setProductToEditStock,
    mode,
    setMode,
    isPending,
    setIsPending,
    selectedWarehouse,
    setSelectedWarehouse,
    selectedSalesChannel,
    setSelectedSalesChannel,
    quantityInput,
    setQuantityInput,
    transactionCode,
    setTransactionCode,
    checkGenerateCode,
    setCheckGenerateCode,
    expirationDate,
    setExpirationDate,
    productStock,
    setProductStock,
    warehousesContainingProduct,
    setWarehousesContainingProduct,
    productBatches,
    setProductBatches,
    selectedBatch,
    setSelectedBatch,
    warehouseStock,
    setWarehouseStock,
    getProducts,
    activePage,
  } = useContext(InventoryContext);

  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (productToEditStock) {
      setProductStock(productToEditStock.qty_in_stock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productToEditStock]);

  useEffect(() => {
    if (selectedWarehouse) {
      async function getProductStockOnSelectedWarehouse(
        productID,
        warehouseID
      ) {
        setIsPending(true);
        const stock = await getProductWarehouseStock(productID, warehouseID);
        setWarehouseStock(stock.qtd_total || 0);
        setIsPending(false);
      }

      getProductStockOnSelectedWarehouse(
        productToEditStock.id,
        selectedWarehouse.id
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouse, productToEditStock]);

  const getWarehouses = useCallback(
    async function getWarehousesProduct() {
      if (productToEditStock) {
        try {
          setIsPending(true);
          const warehouses = await getWarehousesContainingProduct(
            productToEditStock.id
          ).then((res) => res.data?.data);
          setWarehousesContainingProduct(
            warehouses.map((warehouse) => ({
              id: warehouse.warehouse_id,
              code: warehouse.warehouse_code,
              name: warehouse.warehouse_name,
              items: warehouse.warehouse_items,
            }))
          );
        } catch (error) {
          handleError(error);
        } finally {
          setIsPending(false);
        }
      }
    },
    [productToEditStock, setIsPending, setWarehousesContainingProduct]
  );

  useEffect(() => {
    if (mode === "subtract" && productToEditStock) {
      getWarehouses();
    }
  }, [getWarehouses, mode, productToEditStock]);

  useEffect(() => {
    if (
      mode === "subtract" &&
      warehousesContainingProduct &&
      selectedWarehouse
    ) {
      const batchesToDisplay = warehousesContainingProduct.find(
        (warehouse) => warehouse.id === selectedWarehouse.id
      )?.items;

      setProductBatches(batchesToDisplay);
    }
  }, [
    selectedWarehouse,
    mode,
    warehousesContainingProduct,
    warehouses,
    setProductBatches,
  ]);

  let modeProperties = {};

  if (mode === "add") {
    modeProperties = {
      modalTitle: "Entrada de produto em estoque",
      selectLabel: "Selecione o armazém destino:",
      qtyInputLabel: "Quantidade a adicionar",
      codeInputLabel: "Código da compra",
      transactionPriceKey: "price_buy",
      updateStock: stockIncrease,
      transactionTypeKey: "buy_id",
    };
  }

  if (mode === "subtract") {
    modeProperties = {
      modalTitle: "Saída de produto em estoque",
      selectLabel: "Selecione o armazém de saída:",
      qtyInputLabel: "Quantidade a remover",
      codeInputLabel: "Código do Pedido",
      transactionPriceKey: "price_sell",
      updateStock: stockDecrease,
      transactionTypeKey: "sell_id",
      salesChannelKey: "marketplace_id",
    };
  }

  if (!mode) {
    return null;
  }

  if (!productToEditStock) {
    return null;
  }

  async function refetchProducts() {
    setIsLoading(true);
    await getProducts(undefined, activePage);
    setIsLoading(false);
  }

  async function handleSave() {
    setIsPending(true);
    const payload = {
      warehouse_id: selectedWarehouse.id,
      quantity: parseInt(quantityInput),
      [modeProperties.transactionPriceKey]: price,
      expiration_date: (expirationDate && formatDate(expirationDate)) || null,
      [modeProperties.transactionTypeKey]: checkGenerateCode
        ? null
        : transactionCode.length > 0
        ? transactionCode
        : null,
      ...(mode === "subtract" && { marketplace_id: 1 }), // TODO: change to real id later
      ...(mode === "subtract" && {
        stock_item_id: selectedBatch?.id || null,
      }),
    };

    await modeProperties
      .updateStock(productToEditStock.id, payload)
      .then(() => {
        setIsPending(false);
      });

    refetchProducts();

    closeModalAndClearInputs();
  }

  function closeModalAndClearInputs() {
    setProductToEditStock(null);
    setMode(null);
    setSelectedWarehouse(null);
    setSelectedBatch(null);
    setSelectedSalesChannel(null);
    setQuantityInput("");
    setTransactionCode("");
    setExpirationDate(null);
    setCheckGenerateCode(false);
    setWarehouseStock(0);
    setAddModal(!addModal);
  }

  return (
    <ModalStyles mode={mode}>
      <CModal
        centered
        show={addModal}
        closeOnBackdrop={false}
        onClose={() => closeModalAndClearInputs()}
      >
        <CModalHeader closeButton>
          <h4 className="mb-0">{modeProperties.modalTitle}</h4>
        </CModalHeader>

        <CModalBody>
          <ProductNameHeader productToEditStock={productToEditStock} />

          <div>
            <p className="mb-1">{modeProperties.selectLabel}</p>
            {mode === "add" && (
              <WarehouseSelect
                options={warehouses}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
              />
            )}
            {mode === "subtract" && (
              <WarehouseSelect
                options={warehousesContainingProduct}
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
              />
            )}
          </div>

          {warehouses.length === 0 && <NoRegisteredWarehousesWarning />}

          {isPending ? (
            <div className="mt-3">
              <LoadingCardData color="#321fdb" />{" "}
            </div>
          ) : null}

          {selectedWarehouse && !isPending && (
            <>
              {productToEditStock.has_expiration_date && mode === "subtract" && (
                <div className="mt-3">
                  <ProductBatchSelect
                    options={productBatches}
                    value={selectedBatch}
                    onChange={setSelectedBatch}
                  />
                </div>
              )}

              <div className="d-flex mt-3 input-container">
                <WarehouseStockDisplay warehouseStock={warehouseStock} />
                <TotalStockDisplay productStock={productStock} />
              </div>

              <div className="d-flex mt-3 input-container">
                <UpdateStockInput
                  quantity={quantityInput}
                  setQuantity={setQuantityInput}
                  label={modeProperties.qtyInputLabel}
                />

                {mode === "add" && (
                  <>
                    <GenerateCodeInput
                      label={modeProperties.codeInputLabel}
                      checkGenerateCode={checkGenerateCode}
                      setCheckGenerateCode={setCheckGenerateCode}
                      transactionCode={transactionCode}
                      setTransactionCode={setTransactionCode}
                    />
                  </>
                )}

                {mode === "subtract" && (
                  <CInputGroup>
                    <SalesChannelSelect
                      value={selectedSalesChannel}
                      onChange={setSelectedSalesChannel}
                    />
                  </CInputGroup>
                )}
              </div>
              <div className="d-flex mt-3 input-container">
                <ProductPriceInput
                  label="Preço"
                  price={price}
                  setPrice={setPrice}
                />

                {mode === "subtract" && (
                  <GenerateCodeInput
                    label={modeProperties.codeInputLabel}
                    checkGenerateCode={checkGenerateCode}
                    setCheckGenerateCode={setCheckGenerateCode}
                    transactionCode={transactionCode}
                    setTransactionCode={setTransactionCode}
                  />
                )}

                {mode === "add" && productToEditStock.has_expiration_date && (
                  <ExpirationDateInput
                    expirationDate={expirationDate}
                    setExpirationDate={setExpirationDate}
                  />
                )}
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            disabled={
              isPending ||
              !selectedWarehouse ||
              (mode === "subtract" &&
                productToEditStock.has_expiration_date &&
                !selectedBatch)
            }
            color="primary"
            onClick={handleSave}
          >
            Salvar
          </CButton>{" "}
          <CButton
            disabled={isPending}
            color="secondary"
            onClick={() => closeModalAndClearInputs()}
          >
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </ModalStyles>
  );
};

export default StockEditModal;
