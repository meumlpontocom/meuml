import React, { useContext, useEffect, useMemo } from "react";
import { Card, CardHeader }                      from "../atoms";
import { CCardBody, CCol, CLabel, CSwitch }      from "@coreui/react";
import { useSelector }                           from "react-redux";
import { createMlAdvertContext }                 from "../createMlAdvertContext";

const MShops = () => {
  const { setFormData, form } = useContext(createMlAdvertContext);

  const shouldRenderComponent = useMemo(() => !!form.shippingMode, [form.shippingMode]);

  const selectedAccountList = useSelector(state => {
    const accounts = state.accounts.accounts;
    const selectedAccounts = state.accounts.selectedAccounts;
    return Object.values(accounts).filter(account =>
      selectedAccounts.find(selected => selected.value === account.id),
    );
  });

  const accountsWithMShopsTag = useMemo(
    () => selectedAccountList.filter(account => account?.external_data?.tags?.find(() => "mshops")),
    [selectedAccountList],
  );

  useEffect(() => {
    const accounts = {};
    accountsWithMShopsTag.forEach(account => (accounts[account.id] = true));
    setFormData({ id: "checkedMShopsAccounts", value: accounts });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickCheckAccount = id => {
    setFormData({
      id: "checkedMShopsAccounts",
      value: {
        ...form.checkedMShopsAccounts,
        [id]: !form.checkedMShopsAccounts[id]
      }
    });
  };

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="mshops-card">
      <CardHeader title="Mercado Shops" subtitle="Escolha uma loja ou desmarque" />
      <CCardBody>
        <CCol className="mt-5">
          {accountsWithMShopsTag.map(account => (
            <CCol style={{ padding: 0, marginTop: "15px" }}>
              <CSwitch
                variant="outline"
                shape="square"
                color="info"
                size="lg"
                key={account.id}
                id={account.id}
                name={`Publicar na conta MShops ${account.name}`}
                labelOn="Sim"
                labelOff="Não"
                checked={form.checkedMShopsAccounts[account.id]}
                onChange={() => handleClickCheckAccount(account.id)}
              />
              <CLabel htmlFor={account.id} className="ml-2">
                {account.name}
              </CLabel>
            </CCol>
          ))}
        </CCol>
      </CCardBody>
    </Card>
  );
};

MShops.propTypes = {};

export default MShops;
