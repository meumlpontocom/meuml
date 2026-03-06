import React from "react";
import { CAlert } from "@coreui/react";
import { Link } from "react-router-dom";

const NoRegisteredAccountsWarning = () => {
  return (
    <div>
      <CAlert color="warning" className="d-flex align-items-center mt-3 mb-0">
        <i className="cil-warning mr-2" />
        <em>
          Nenhum conta cadastrada. Você pode cadastrar contas{" "}
          <strong>
            <Link to="/contas">clicando aqui.</Link>
          </strong>
        </em>
      </CAlert>
    </div>
  );
};

export default NoRegisteredAccountsWarning;
