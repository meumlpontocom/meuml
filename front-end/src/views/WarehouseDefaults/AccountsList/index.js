import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CListGroup,
  CListGroupItem,
  CButton,
  CSpinner,
} from "@coreui/react";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import Swal from "sweetalert2";
import SingleAccount from "./SingleAccount";
import NoRegisteredWarehousesWarning from "../../../components/Warnings/NoRegisteredWarehousesWarning";
import NoRegisteredAccountsWarning from "../../../components/Warnings/NoRegisteredAccountsWarning";

const AccountsList = ({ accounts, warehouses }) => {
  const [isPending, setIsPending] = useState(false);
  const [userWarehouseSettings, setUserWarehouseSettings] = useState([]);

  const accountsDefaultWarehouses = useSelector(
    (state) => state.accounts.accounts
  );

  function getAccountDefaultWarehouse(id) {
    let accountsDefaultWarehousesArray = Object.keys(
      accountsDefaultWarehouses
    ).map((k) => accountsDefaultWarehouses[k]);

    const account = accountsDefaultWarehousesArray.find(
      (account) => account.id === id
    );

    if (!account) return null;

    const accountDefaultWarehouse = {
      id: account.warehouse_id,
      code: account.warehouse_code,
      name: account.warehouse_name,
    };

    return accountDefaultWarehouse;
  }

  async function setDefaultWarehouses(warehouseID, marketplaceID, accountID) {
    const data = {
      marketplace_id: marketplaceID,
      account_id: accountID,
    };

    const res = await api.post(`/warehouses/${warehouseID}/default`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res;
  }

  async function handleSave() {
    setIsPending(true);

    const requestsStatus = [];

    for (const userSetting of userWarehouseSettings) {
      await setDefaultWarehouses(
        userSetting.warehouse_id,
        userSetting.marketplace_id,
        userSetting.account_id
      )
        .then((res) => {
          const status = res.data.status;
          requestsStatus.push(status);
        })
        .catch((error) => {
          if (error.response) {
            Swal.fire({
              title: "Erro",
              html: `<p>${error.response.data.message}</p>`,
              type: "error.response.data.message",
              showCloseButton: true,
            });
          } else {
            Swal.fire({
              title: "Erro",
              html: `<p>${error.message ? error.message : error}</p>`,
              type: "error",
              showCloseButton: true,
            });
          }
          return error;
        });
    }

    const pluralOrSingularAccount =
      userWarehouseSettings.length > 1 || userWarehouseSettings.length === 0
        ? "contas"
        : "conta";

    if (
      requestsStatus.length > 0 &&
      requestsStatus.every((status) => status === "success")
    ) {
      Swal.fire(
        "Sucesso",
        `Alteração feita com sucesso em ${userWarehouseSettings.length} ${pluralOrSingularAccount}!`,
        "success"
      );
    }

    setUserWarehouseSettings([]);
    setIsPending(false);
  }

  if (!accounts || accounts.length < 1) {
    return <NoRegisteredAccountsWarning />;
  }

  if (!warehouses || warehouses.length < 1) {
    return <NoRegisteredWarehousesWarning />;
  }

  return (
    <>
      <CCard>
        <CCardHeader>
          <h4 className="mb-0">Contas</h4>
        </CCardHeader>
        <CCardBody>
          <CListGroupItem className="rounded mb-1 d-flex justify-content-between align-items-center">
            <strong className="mr-5">NOME</strong>
            <strong>ARMAZÉM PADRÃO</strong>
          </CListGroupItem>
          <CListGroup accent>
            {accounts.map((account) => (
              <SingleAccount
                key={account.id}
                account={account}
                warehouses={warehouses}
                accountDefaultWarehouse={getAccountDefaultWarehouse(account.id)}
                setUserWarehouseSettings={setUserWarehouseSettings}
                userWarehouseSettings={userWarehouseSettings}
              />
            ))}
          </CListGroup>
        </CCardBody>
        <CCardFooter className="d-flex justify-content-end">
          <CButton
            disabled={isPending || userWarehouseSettings.length < 1}
            variant="outline"
            color="success"
            className="d-flex justify-content-center align-items-center text-uppercase font-weight-bold ml-3 w-25"
            onClick={handleSave}
          >
            <span>Salvar</span>
            {isPending && <CSpinner size="sm" className="ml-1" />}
          </CButton>
        </CCardFooter>
      </CCard>
    </>
  );
};

export default AccountsList;
