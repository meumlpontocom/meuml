import React from "react";
import { Row } from "reactstrap";
import DropDown from "../DropDown";
import { Data } from "../../../../containers/Data";
import "./index.css";

const SelectAccount = () => (
  <Data.Consumer>
    {provider => {
      return provider.state.accountsFound === 0 ? (
        <h6>Nenhuma conta do ML encontrada.</h6>
      ) : (
        <Row>
          <DropDown id="button" color="primary" title="Selecionar Conta">
            {provider.state.accounts.map((acc, key) => (
              <button className="dropdown dropdown-item" key={key} onClick={() => provider.selectAccount(acc.id)}>
                {acc.name}
              </button>
            ))}
          </DropDown>
        </Row>
      );
    }}
  </Data.Consumer>
);

export default SelectAccount;
