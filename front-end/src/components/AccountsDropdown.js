/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import Col from "reactstrap/lib/Col";
import api from "../services/api";
import { Picky } from "react-picky";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { saveAccounts, saveSelectedAccounts } from "../redux/actions";
import { getToken } from "../services/auth";

export default function AccountsDropdown({ placeholder, platform, multiple, label, xs, sm, md, lg, style }) {
  const workbench = useSelector(state => state.accounts);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  async function fetchAccounts() {
    try {
      setIsLoading(true);
      const {
        data: { data },
      } = await api.get("/accounts", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      dispatch(saveAccounts(data));
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Erro!",
          html: `<p>${error.response.data.message}</p>`,
          type: "error",
          showCloseButton: true,
        });
        return error.response;
      }
      Swal.fire({
        title: "Erro!",
        html: `<p>${error.message ? error.message : error}</p>`,
        type: "error",
        showCloseButton: true,
      });
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  function onSelect(selectedAccountsArray) {
    dispatch(saveSelectedAccounts(selectedAccountsArray));
  }

  const accounts = useMemo(() => {
    const { accounts } = workbench;
    let accountsArray = [];
    for (const account in accounts) {
      if (accounts.hasOwnProperty(account)) {
        const element = accounts[account];
        accountsArray.push(element);
      }
    }
    return accountsArray
      .filter(account => account.internal_status === 1 && account.platform === platform)
      .map(account => ({
        label: account.name,
        value: account.id,
      }));
  }, [workbench]);

  const selected = useMemo(() => {
    return workbench.selectedAccounts.length ? workbench.selectedAccounts : [];
  }, [workbench.selectedAccounts]);

  const DefaultLabel = () => <h4 className="text-primary">Selecionar conta(s): </h4>;

  return (
    <Col
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      style={style ? { ...style } : { padding: "0px", marginBottom: "2.5rem" }}
    >
      {label || DefaultLabel}
      <Picky
        onChange={selected => onSelect(selected)}
        includeSelectAll={true}
        includeFilter={true}
        dropdownHeight={600}
        multiple={multiple}
        options={accounts}
        value={selected}
        open={false}
        valueKey="value"
        labelKey="label"
        id="account-select"
        name="account-select"
        className="multiSelBlockUser"
        selectAllText="Selecionar Todos"
        filterPlaceholder="Filtrar por..."
        allSelectedPlaceholder="%s Selecionados"
        manySelectedPlaceholder="%s Selecionados"
        placeholder={placeholder || "Contas do Mercado Livre . . ."}
        disabled={isLoading}
      />
    </Col>
  );
}
