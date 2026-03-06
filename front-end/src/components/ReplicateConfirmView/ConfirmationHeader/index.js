import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CCard, CCardBody, CRow, CCol, CLabel } from "@coreui/react";
import { useHistory } from "react-router-dom";
import SelectAccounts from "../../SelectAccounts";
import SelectedInfo from "../ConfirmationBody/SelectedInfo";
import EstimatedCoast from "../ConfirmationBody/EstimatedCoast";
import {
  saveSelectedAccounts,
  setReplicationMode,
  setAccountsOfficialStores,
  setIsLoadingAccountsOfficialStores,
  setSelectedOfficialStore,
} from "../../../redux/actions/_replicationActions";
import AvailableCreditsCallout from "../ConfirmationBody/AvailableCreditsCallout";
import SwitchComponent from "src/components/SwitchComponent";
import { checkOfficialStores } from "./checkOfficialStores";
import SelectOfficialStores from "src/components/SelectOfficialStores";

export default function ConfirmationHeader() {
  const history = useHistory();
  const dispatch = useDispatch();
  const selectedAccounts = useSelector(state => state.advertsReplication.selectedAccounts);
  const replicationMode = useSelector(state => state.advertsReplication.replication_mode);
  const selectedOfficialStore = useSelector(state => state.advertsReplication.selectedOfficialStore);
  const accountsOfficialStores = useSelector(state => state.advertsReplication.accountsOfficialStores);
  const isLoadingAccountsOfficialStores = useSelector(
    state => state.advertsReplication.isLoadingAccountsOfficialStores,
  );

  const accountsWithOfficialStore = accountsOfficialStores.filter(
    account => !!account.official_stores?.length,
  ).length;

  const setSelectedAccounts = useCallback(
    selected => {
      dispatch(saveSelectedAccounts(selected));
    },
    [dispatch],
  );

  const selectOfficialStore = officialStore => {
    const accountThatHasOfficialStore = accountsOfficialStores.filter(
      account => !!account.official_stores?.length,
    );

    const accountId = accountThatHasOfficialStore[0].account_id;

    const selectedOfficialStore = {};
    selectedOfficialStore[accountId] = officialStore.id;

    dispatch(setSelectedOfficialStore(selectedOfficialStore));
  };

  const handleSetReplicationMode = useCallback(
    value => {
      const newValue = value === "standard" ? "forced" : "standard";
      dispatch(setReplicationMode(newValue));
    },
    [dispatch],
  );

  const checkSelectedAccountsOfficialStores = useCallback(async () => {
    if (!selectedAccounts?.length) {
      dispatch(setAccountsOfficialStores([]));
      dispatch(setSelectedOfficialStore({}));
      return;
    }

    dispatch(setIsLoadingAccountsOfficialStores(true));

    const selectedAccountsIds = selectedAccounts.map(account => account.id).join(",");

    const accounts = await checkOfficialStores(selectedAccountsIds);

    const accountsWithOfficialStore = accounts.filter(account => !!account.official_stores?.length);

    if (accountsWithOfficialStore.length === 0) {
      dispatch(setAccountsOfficialStores([]));
    } else {
      dispatch(setAccountsOfficialStores(accountsWithOfficialStore));
    }

    if (accountsWithOfficialStore.length !== 1) {
      dispatch(setSelectedOfficialStore({}));
    }

    dispatch(setIsLoadingAccountsOfficialStores(false));
  }, [selectedAccounts, dispatch]);

  useEffect(() => {
    checkSelectedAccountsOfficialStores();
  }, [checkSelectedAccountsOfficialStores]);

  return (
    <CCard>
      <CCardBody>
        <CRow>
          <AvailableCreditsCallout />
          <SelectedInfo history={history} />
          <EstimatedCoast />
        </CRow>

        <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center" }}>
          <CCol xs={12} sm={12} md={12} lg={4} className="mt-4">
            <div>
              <h4 className="text-info">Selecionar contas</h4>
              <SelectAccounts
                id="select-accounts"
                name="select-accounts"
                placeholder="Selecionar contas de destino"
                selected={selectedAccounts}
                callback={setSelectedAccounts}
                multipleSelection={true}
                disabled={isLoadingAccountsOfficialStores}
              />
            </div>
          </CCol>

          <CCol xs={12} sm={12} md={12} lg={4} className="mt-4">
            <div>
              <CLabel htmlFor="use-internal-data">Modo de replicação</CLabel>
              <SwitchComponent
                id="use-internal-data"
                name="use-internal-data"
                checked={replicationMode !== "standard"}
                value={replicationMode}
                onChange={e => handleSetReplicationMode(e.target.value)}
                leftText={{ text: "Padrão", color: "text-success" }}
                rightText={{ text: "Forçado (Nessa opção, pode faltar alguns dados)", color: "text-danger" }}
              />
            </div>
          </CCol>
        </div>

        <CCol xs={12} sm={12} md={12} lg={4} className="mt-4">
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "8px" }}>
              <h4 className="text-info" style={{ marginBottom: 0 }}>
                Loja oficial
              </h4>

              {!isLoadingAccountsOfficialStores &&
                !!selectedAccounts.length &&
                !accountsWithOfficialStore && (
                  <h5 style={{ fontSize: "12px", marginBottom: "4px" }}>
                    (Nenhuma Loja Oficial disponível as contas selecionadas)
                  </h5>
                )}
            </div>
            <SelectOfficialStores
              id="select-official-store"
              name="select-official-store"
              selected={selectedOfficialStore}
              callback={selectOfficialStore}
              multipleSelection={false}
              disabled={isLoadingAccountsOfficialStores || accountsWithOfficialStore !== 1}
              placeholder={"Selecione uma Loja Oficial"}
            />

            {accountsWithOfficialStore > 1 && (
              <div style={{ fontSize: "12px", color: "red" }}>
                Mais de uma conta de destino possui Loja Official. Só é possível replicar para, no máximo, uma
                conta com loja oficial por vez.
              </div>
            )}
          </div>
        </CCol>
      </CCardBody>
    </CCard>
  );
}
