import React, { useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "reactstrap/lib/Dropdown";
import DropdownMenu from "reactstrap/lib/DropdownMenu";
import DropdownToggle from "reactstrap/lib/DropdownToggle";
import DropdownItem from "reactstrap/lib/DropdownItem";
import PropTypes from "prop-types";
import { deleteAccount, renameAccount, syncAccount } from "./requests";
import { useDispatch, useSelector } from "react-redux";

function CardMenu({ id, platform }) {
  const dispatch = useDispatch();
  const [accountSyncList, setAccountSyncList] = React.useState({})
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);
  const { accounts } = useSelector(state => state.accounts);

  const accountInternalTags = accounts[id].external_data?.internal_tags;
  const accountHasFlexFunctionalities = accountInternalTags?.includes('meuml_tag_flex');

  return (
    <Dropdown size="sm" isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle color="secondary">
        <i className="cil-cog mr-1" /> Configurações
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => renameAccount({ platform, dispatch, account_id: id })}>
          <i className="cil-pen mr-1" />
          Renomear
        </DropdownItem>
        <DropdownItem onClick={() => syncAccount({ platform, dispatch, account_id: id, syncState: { accountSyncList, setAccountSyncList } })}>
          <i className="cil-sync mr-1" />
          Sincronizar
        </DropdownItem>
        <DropdownItem onClick={() => deleteAccount({ platform, dispatch, account_id: id })}>
          <i className="cil-trash mr-1" />
          Excluir
        </DropdownItem>
        {platform === "ML" && accountHasFlexFunctionalities ? (
          <>
            <Link className="dropdown-item" to={`/configurar-envio-flex/${id}`}>
              <i className="cil-truck mr-1" />
          Configurar envio Flex
        </Link>
            <Link
              className="dropdown-item"
              to={`/configurar-area-de-cobertura-flex/${id}`}
            >
              <i className="cil-map mr-1" />
          Área de Cobertura Flex
        </Link>
          </>) : <></>}
      </DropdownMenu>
    </Dropdown>
  );
}

CardMenu.propTypes = {
  id: PropTypes.string,
  platform: PropTypes.string
};

export default CardMenu;
