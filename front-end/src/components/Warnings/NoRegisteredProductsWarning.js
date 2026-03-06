import React from "react";
import { CAlert } from "@coreui/react";
import { Link } from "react-router-dom";

const NoRegisteredProductsWarning = () => {
  return (
    <div>
      <CAlert color="warning" className="d-flex align-items-center mt-3 mb-0">
        <i className="cil-warning mr-2" />
        <em>
          Nenhum produto cadastrado. Você pode cadastrar produtos{" "}
          <strong>
            <Link to="/produtos/novo">clicando aqui.</Link>
          </strong>
        </em>
      </CAlert>
    </div>
  );
};

export default NoRegisteredProductsWarning;
