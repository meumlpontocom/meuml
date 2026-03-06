import React, { useState, useContext, useEffect } from "react";
import NoRegisteredProducts                       from "../../../components/Warnings/NoRegisteredProductsWarning";
import { RegisteredProductsContext }              from "../RegisteredProductsContext";
import CDataTableStylesContainer                  from "./CDataTablesStylesContainer";
import { CDataTable }                             from "@coreui/react";
import { useHistory }                             from "react-router-dom";
import TableFilters                               from "./TableFilters";
import TableButtons                               from "./TableButtons";
import dataTableFields                            from "./dataTableFields";
import DetailsCollapse                            from "./DetailsCollapse";
import Pagination                                 from "./Pagination";
import { ProductRegistrationContext }             from "src/views/ProductRegistration/ProductRegistrationContext";
import { getProductDetailsRequest }               from "../requests";

const ProductDataTable = () => {
  const history = useHistory();
  const [isLoadingEditBtn, setIsLoadingEditBtn] = useState(false);
  const [collapsedID, setCollapsedID] = useState("");
  const [isLoadingDetails, setLoadingDetails] = useState(false);
  const [collapsedProductDetails, setCollapsedProductDetails] = useState({});
  const { products, fetchProductDetails } = useContext(
    RegisteredProductsContext,
  );
  const { setProductAttributesList, setHasExpirationDate, setProductInfo } =
    useContext(ProductRegistrationContext);

  useEffect(() => {
    if (collapsedID) {
      fetchProductDetails(collapsedID, setLoadingDetails).then((product) => {
        setCollapsedProductDetails(product);
        setProductAttributesList(product.attributes);
        setHasExpirationDate(product.has_expiration_date);
        setProductInfo({
          name: product.name,
          sku: product.sku,
          description: product.description,
        });
      });
    }
  }, [
    collapsedID,
    fetchProductDetails,
    setHasExpirationDate,
    setProductAttributesList,
    setProductInfo,
  ]);

  function toggleDetails(productID) {
    setCollapsedID((prev) => (productID === prev ? "" : productID));
  }

  function editProduct(item, updateType) {
    const handleLoadingEditBtn = (isLoading) => {
      if (isLoading) setIsLoadingEditBtn(item.id);
      else setIsLoadingEditBtn(null);
    };

    const historyConfig = {
      pathname: "/produtos/novo",
      state: {
        item,
        [updateType]: true,
      },
    };
    // IF PRODUCT IS A PARENT, MUST REQUEST PRODUCT'S DATA TO SERVER
    if (!("attributes" in historyConfig.state.item)) {
      return getProductDetailsRequest(item.id, handleLoadingEditBtn).then(
        (response) => {
          return history.push({
            ...historyConfig,
            state: { ...historyConfig.state, item: response.data.data },
          })
        },
      );
    }
    // PRODUCT'S VARIATIONS ALREADY HAVE ITS OWN DATA
    return history.push(historyConfig);
  }

  const ActiveText = ({ text }) => <h4 className="text-primary">{text}</h4>;

  const DefaultText = ({ text }) => <h6 className="text-dark">{text}</h6>;

  return !products ? (
    <></>
  ) : (
    <CDataTableStylesContainer>
      {products && (
        <CDataTable
          responsive
          overTableSlot={<TableFilters />}
          items={products}
          fields={dataTableFields}
          itemsPerPage={50}
          hover={products.length > 0}
          noItemsViewSlot={<NoRegisteredProducts />}
          underTableSlot={<Pagination />}
          scopedSlots={{
            sku: (item) => (
              <td>
                {item.id === collapsedID ? (
                  <ActiveText text={item.sku} />
                ) : (
                  <DefaultText text={item.sku} />
                )}
              </td>
            ),
            name: (item) => (
              <td>
                {item.id === collapsedID ? (
                  <ActiveText text={item.name} />
                ) : (
                  <DefaultText text={item.name} />
                )}
              </td>
            ),
            table_buttons: (item) => (
              <TableButtons
                id={item.id}
                sku={item.sku}
                toggleDetails={toggleDetails}
                isOpen={item.id === collapsedID}
                isLoadingEditBtn={isLoadingEditBtn}
                update={(updateType) => editProduct(item, updateType)}
              />
            ),
            details: (item) => (
              <DetailsCollapse
                isOpen={item.id === collapsedID}
                isLoadingDetails={isLoadingDetails}
                collapsedProductDetails={collapsedProductDetails}
                editVariation={(variation, updateType) =>
                  editProduct(variation, updateType)
                }
              />
            ),
          }}
        />
      )}
    </CDataTableStylesContainer>
  );
};

export default ProductDataTable;
