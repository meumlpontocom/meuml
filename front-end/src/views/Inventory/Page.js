import React, { useCallback, useContext, useEffect, useState } from "react";
import LoadPageHandler                                         from "../../components/Loading";
import { CCard, CCardBody }                                    from "@coreui/react";
import PageHeader                                              from "../../components/PageHeader";
import StockEditModal                                          from "./StockEditModal/";
import ProductsList                                            from "./ProductsList";
import { getWarehouses }                                       from "./inventoryRequests";
import { InventoryContext }                                    from "./InventoryContext";
import CallToAction                                            from "src/views/CallToAction";

const Page = () => {
  const [error402, setError402] = useState(() => false);
  const { isLoading, setIsLoading, setWarehouses, getProducts } =
    useContext(InventoryContext);

  const getProductsAndWarehouses = useCallback(
    async function () {
      setIsLoading(true);
      await getProducts();
      const res = await getWarehouses();
      if (res.statusCode === 402) {
        setError402(true);
      } else {
        setWarehouses(res.data.data);
        setIsLoading(false);
      }
    },
    [getProducts, setIsLoading, setWarehouses],
  );

  useEffect(() => {
    getProductsAndWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return error402 ? (
    <CallToAction />
  ) : (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <div>
          <PageHeader heading="Estoque" />
          <StockEditModal />
          <CCard className="card-accent-primary">
            <CCardBody>
              <ProductsList />
            </CCardBody>
          </CCard>
        </div>
      }
    />
  );
};

export default Page;
