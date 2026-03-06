import React from "react";
import { CAlert } from "@coreui/react";

const NoStockForThisProduct = () => {
  return (
    <div>
      <CAlert color="warning" className="d-flex align-items-center mt-3 mb-0">
        <i className="cil-warning mr-2" />
        <em>Não há estoque para este produto!</em>
      </CAlert>
    </div>
  );
};

export default NoStockForThisProduct;
