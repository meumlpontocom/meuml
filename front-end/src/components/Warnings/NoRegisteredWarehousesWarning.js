import React from "react";
import { CAlert } from "@coreui/react";
import { Link } from "react-router-dom";

const NoRegisteredWarehousesWarning = () => {
  return (
    <div>
      <CAlert color="warning" className="d-flex align-items-center mt-3 mb-0">
        <i className="cil-warning mr-2" />
        <em>
          Nenhum armazém cadastrado. Você pode cadastrar armazéns{" "}
          <strong>
            <Link to="/armazem">clicando aqui.</Link>
          </strong>
        </em>
      </CAlert>
    </div>
  );
};

export default NoRegisteredWarehousesWarning;
