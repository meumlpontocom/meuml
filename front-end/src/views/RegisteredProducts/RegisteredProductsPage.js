import React, { useEffect, useContext } from "react";
import PageHeader                       from "../../components/PageHeader";
import { useHistory }                   from "react-router-dom";
import LoadPageHandler                  from "../../components/Loading";
import ProductDataTable                 from "./ProductDataTable";
import { CCard, CCardBody }             from "@coreui/react";
import { RegisteredProductsContext }    from "./RegisteredProductsContext";

const RegisteredProductsPage = () => {
  const history = useHistory();
  const { isLoading, getProducts } = useContext(RegisteredProductsContext);

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (history.location.state?.wasEditing) getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <div>
          <PageHeader heading="Produtos Cadastrados" />
          <CCard className="card-accent-primary">
            <CCardBody>
              <ProductDataTable />
            </CCardBody>
          </CCard>
        </div>
      }
    />
  );
};

export default RegisteredProductsPage;
