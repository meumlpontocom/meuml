import React           from "react";
import { CCardHeader } from "@coreui/react";

const CardHeader = () => {
  return (
    <CCardHeader className="bg-gradient-secondary">
      <h3 className="text-info">
        Prévia do anúncio&nbsp;
        <small className="text-muted">Mercado Livre</small>
      </h3>
    </CCardHeader>
  );
};

export default CardHeader;
