import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { PlanSignUpContext } from "../PlanSignUpContext";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import { StyledPicky } from "../../../components/StyledPicky";
import LoadingCardData from "src/components/LoadingCardData";

const AccountsSelectors = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allAccounts, setAllAccounts] = useState([]);
  const [selectedAccountsML, setSelectedAccountsML] = useState([]);
  const [selectedAccountsSP, setSelectedAccountsSP] = useState([]);
  const { setAllSelectedAccounts } = useContext(PlanSignUpContext);

  async function getAllAccounts() {
    const res = await api.get("/accounts", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const accounts = res.data.data.map(account => {
      return {
        id: account.id,
        name: account.external_name || account.name,
        platform: account.platform,
      };
    });
    return accounts;
  }

  useEffect(() => {
    getAllAccounts()
      .then(accounts => {
        setAllAccounts(accounts);
        setIsLoading(false);
      })
      .catch(error => {
        Swal.fire({
          title: "Ops!",
          html: `<p>${error.response.data.message || error}</p>`,
          type: "warning",
          showCloseButton: true,
        });
        return error.response || error;
      });
  }, []);

  function handleChangeML(accounts) {
    setSelectedAccountsML(accounts);
  }
  function handleChangeSP(accounts) {
    setSelectedAccountsSP(accounts);
  }

  useEffect(() => {
    const allSelectedAccounts = selectedAccountsML.concat(selectedAccountsSP);
    setAllSelectedAccounts(allSelectedAccounts);
  }, [selectedAccountsML, selectedAccountsSP, setAllSelectedAccounts]);

  return (
    <>
      {isLoading ? (
        <LoadingCardData color="#3c4b64" />
      ) : (
        <div>
          <h5>
            Selecione uma conta <span>Mercado Livre</span> para ver as opções de planos
          </h5>
          <StyledPicky
            options={allAccounts.filter(({ platform }) => platform === "ML")}
            value={selectedAccountsML}
            onChange={handleChangeML}
            open={false}
            multiple={true}
            labelKey="name"
            valueKey="id"
            includeFilter={true}
            dropdownHeight={600}
            includeSelectAll={true}
            placeholder="Selecione uma ou mais contas"
            selectAllText="Selecionar Todas"
            filterPlaceholder="Buscar conta"
            allSelectedPlaceholder="Todos (%s)"
            manySelectedPlaceholder="%s selecionadas"
          />
          <h5 className="mt-3">
            Selecione uma conta <span>Shopee</span> para ver os módulos de funcionalidades
          </h5>
          <StyledPicky
            options={allAccounts.filter(({ platform }) => platform === "SP")}
            value={selectedAccountsSP}
            onChange={handleChangeSP}
            open={false}
            multiple={true}
            labelKey="name"
            valueKey="id"
            includeFilter={true}
            dropdownHeight={600}
            includeSelectAll={true}
            placeholder="Selecione uma ou mais contas"
            selectAllText="Selecionar Todas"
            filterPlaceholder="Buscar conta"
            allSelectedPlaceholder="Todos (%s)"
            manySelectedPlaceholder="%s selecionadas"
          />
        </div>
      )}
    </>
  );
};

export default AccountsSelectors;
