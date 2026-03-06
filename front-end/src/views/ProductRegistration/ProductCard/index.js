import React, { useEffect, useContext } from "react";
import {
  CCard,
  CCardBody,
  CLabel,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CTextarea,
  CCardHeader,
  CCardFooter,
} from "@coreui/react";
import { ProductRegistrationContext } from "../ProductRegistrationContext";

const ProductCard = ({ isVariation, parentID, parentSKU }) => {
  const {
    productInfo,
    setProductInfo,
    hasExpirationDate,
    setHasExpirationDate,
    isPending,
  } = useContext(ProductRegistrationContext);

  function handleChange(e) {
    let value = e.target.value;
    if (e.type === "blur") value = value.trim();
    setProductInfo({
      ...productInfo,
      [e.target.name]: value,
    });
  }

  useEffect(() => {
    setHasExpirationDate(Boolean(productInfo.has_expiration_date));
  }, [productInfo.has_expiration_date, setHasExpirationDate]);

  return (
    <CCard className="form-card">
      <CCardHeader>
        <h5 className="mb-0">Produto</h5>
      </CCardHeader>
      <CCardBody>
        {isVariation && parentSKU && (
          <>
            <CLabel htmlFor="parent-sku" className="mt-2 text-muted">
              SKU Produto Principal
            </CLabel>
            <CInputGroup className="mb-2">
              <CInputGroupPrepend>
                <CInputGroupText>
                  <i className="cil-barcode" />
                </CInputGroupText>
              </CInputGroupPrepend>
              <CInput
                disabled={true}
                id="parent-sku"
                name="sku"
                type="text"
                maxLength={50}
                value={parentSKU}
                readOnly={true}
              />
            </CInputGroup>{" "}
          </>
        )}

        <CLabel htmlFor="product-sku" className="mt-2 text-muted">
          SKU {isVariation && parentID && "Variação de Produto"}
        </CLabel>
        <CInputGroup className="mb-2">
          <CInputGroupPrepend>
            <CInputGroupText>
              <i className="cil-barcode" />
            </CInputGroupText>
          </CInputGroupPrepend>
          <CInput
            disabled={isPending}
            id="product-sku"
            name="sku"
            type="text"
            maxLength={50}
            placeholder="Digite o código a ser atribuido ao produto"
            value={productInfo.sku}
            onChange={handleChange}
            onBlur={handleChange}
          />
        </CInputGroup>

        <CLabel htmlFor="product-name" className="text-muted">
          Nome do produto
        </CLabel>
        <CInputGroup className="mb-2">
          <CInputGroupPrepend>
            <CInputGroupText>
              <i className="cil-short-text" />
            </CInputGroupText>
          </CInputGroupPrepend>
          <CInput
            disabled={isPending}
            id="product-name"
            name="name"
            type="text"
            placeholder="Nome descritivo para o produto"
            value={productInfo.name}
            onChange={handleChange}
            onBlur={handleChange}
          />
        </CInputGroup>

        <CLabel htmlFor="product-description" className="mt-2 text-muted">
          Descrição
        </CLabel>
        <CInputGroup className="mb-2">
          <CTextarea
            disabled={isPending}
            id="product-description"
            name="description"
            type="textarea"
            rows="8"
            maxLength="10000"
            placeholder="Descreva as características mais importantes do produto"
            value={productInfo.description}
            onChange={handleChange}
            onBlur={handleChange}
          />
        </CInputGroup>
      </CCardBody>
      <CCardFooter className=" text-dark bg-gradient-light">
        <div className="form-check font-weight-bold">
          <input
            disabled={isPending}
            type="checkbox"
            className="form-check-input"
            id="has-expiration-date"
            checked={hasExpirationDate}
            onChange={(e) => setHasExpirationDate(e.currentTarget.checked)}
          />
          <label className="form-check-label" htmlFor="has-expiration-date">
            Este produto possui data de validade.
          </label>
        </div>
      </CCardFooter>
    </CCard>
  );
};

export default ProductCard;
