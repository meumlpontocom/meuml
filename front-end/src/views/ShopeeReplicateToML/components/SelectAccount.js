import React, { useContext, useEffect } from "react";
import BlackCard from "./BlackCard";
import { CCol, CLabel } from "@coreui/react";
import { FaUsers } from "react-icons/fa";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";
import SelectAccounts from "../../../components/SelectAccounts";
import { checkOfficialStores } from "src/components/ReplicateConfirmView/ConfirmationHeader/checkOfficialStores";
import SelectOfficialStores from "./SelectOfficialStore";

const SelectAccount = () => {
  const {
    selectedAccounts,
    setSelectedAccounts,
    accountsOfficialStores,
    setAccountsOfficialStores,
    selectedOfficialStore,
    setSelectedOfficialStore,
    loadingOfficialStores,
    setLoadingOfficialStores,
    form,
    setForm,
  } = useContext(shopeeReplicateToMLContext);

  function handleSelectAccount(value) {
    setSelectedAccounts([value]);
  }

  const accountsWithOfficialStore = accountsOfficialStores.filter(
    account => !!account.official_stores?.length,
  ).length;

  const selectOfficialStore = officialStore => {
    setSelectedOfficialStore(officialStore);

    setForm({ ...form, official_store_id: officialStore.id });
  };

  async function checkSelectedAccountOfficialStores() {
    if (!selectedAccounts?.length) {
      setAccountsOfficialStores([]);
      setSelectedOfficialStore(null);
      return;
    }
    setLoadingOfficialStores(true);

    const selectedAccountsIds = selectedAccounts.map(account => account.id).join(",");
    const accounts = await checkOfficialStores(selectedAccountsIds);

    const accountsWithOfficialStore = accounts.filter(account => !!account.official_stores?.length);

    if (accountsWithOfficialStore.length === 0) {
      setAccountsOfficialStores([]);
    } else {
      setAccountsOfficialStores(accountsWithOfficialStore);
    }

    if (accountsWithOfficialStore.length !== 1) {
      setSelectedOfficialStore(null);
    }

    setLoadingOfficialStores(false);
  }

  useEffect(() => {
    checkSelectedAccountOfficialStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- checkSelectedAccountOfficialStores is redefined every render; only re-run when selectedAccounts changes
  }, [selectedAccounts]);

  return (
    <CCol xs={12} md={6}>
      <BlackCard
        header={
          <h3>
            <FaUsers />
            &nbsp; Contas do Mercado Livre
          </h3>
        }
        body={
          <>
            <CCol xs={12} className="mb-3 mt-4 text-info">
              <CLabel htmlFor="select-account-dropdown">
                <strong>Selecione uma conta de destino</strong>
              </CLabel>
              <SelectAccounts
                multipleSelection={false}
                includeSelectAll={false}
                includeFilter={true}
                platform="ML"
                placeholder="Selecionar conta ML"
                selected={selectedAccounts}
                callback={handleSelectAccount}
              />
            </CCol>

            <CCol xs={12} className="mb-3 mt-4 text-info">
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "8px" }}>
                  <strong className="text-info" style={{ marginBottom: 0 }}>
                    Loja oficial
                  </strong>

                  {!loadingOfficialStores && !!selectedAccounts.length && !accountsWithOfficialStore && (
                    <h5 style={{ fontSize: "12px", marginBottom: "4px" }}>
                      (Nenhuma Loja Oficial disponível as contas selecionadas)
                    </h5>
                  )}
                </div>
                <SelectOfficialStores
                  id="select-official-store-shopee"
                  name="select-official-store-shopee"
                  selected={selectedOfficialStore}
                  callback={selectOfficialStore}
                  multipleSelection={false}
                  disabled={loadingOfficialStores || accountsWithOfficialStore !== 1}
                  placeholder={"Selecione uma Loja Oficial"}
                />

                {accountsWithOfficialStore === 1 && !selectedOfficialStore && (
                  <div style={{ fontSize: "12px", color: "red" }}>
                    É necessário selecionar uma Loja oficial para essa conta
                  </div>
                )}
              </div>
            </CCol>
          </>
        }
      />
    </CCol>
  );
};

export default SelectAccount;
