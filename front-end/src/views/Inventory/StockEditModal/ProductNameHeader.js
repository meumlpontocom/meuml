import React from "react";

const ProductNameHeader = ({ productToEditStock }) => {
  return (
    <div className="product-info bg-gradient-light">
      <h5 className="product-name">
        <span>Produto: </span>
        <span className="text-primary">{productToEditStock.name}</span>
      </h5>
      <h5 className="product-sku">
        <span>SKU: </span>
        <span className="text-primary">{productToEditStock.sku}</span>
      </h5>
    </div>
  );
};

export default ProductNameHeader;
