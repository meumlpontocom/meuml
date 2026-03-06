import React, { useContext, useMemo } from "react";
import { useSelector }                from "react-redux";
import { Card, CardHeader }           from "../../atoms";
import { CCardBody, CCol, CSelect }   from "@coreui/react";
import styled                         from "styled-components";
import { createMlAdvertContext }      from "../../createMlAdvertContext";

const Col = styled(CCol)`
  padding-left: 0;
  padding-right: 0;
`;

const ShippingModeSelect = () => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const shouldRenderComponent = useMemo(
    () => !!form?.listingType,
    [form.listingType]
  );

  const accounts = useSelector((state) => state.accounts.accounts);
  const selectedAccounts = useSelector(
    (state) => state.accounts.selectedAccounts
  );

  const availableOptions = useMemo(() => {
    if (selectedAccounts.length) {
      return selectedAccounts.reduce((options, account) => {
        const accountShippingModes =
          accounts[account.value].shipping_modes || [];

        if (accountShippingModes.length) {
          return [...new Set([...options, ...accountShippingModes])].map(
            (shippingMode) => ({
              name:
                shippingMode === "custom"
                  ? "Customizado"
                  : shippingMode === "not_specified"
                  ? "Não especificado"
                  : "Mercado Envios",
              id: shippingMode,
            })
          );
        }

        return options;
      }, []);
    }

    return [];
  }, [accounts, selectedAccounts]);

  function handleSelectValueChange({ target: { id, value } }) {
    setFormData({ id, value });
  }

  return (
    <Col xs="12">
      <Card
        isVisible={shouldRenderComponent}
        id="select-shippingMode-card"
        className="border-primary"
      >
        <CardHeader title="Modalidade de frete" />
        <CCardBody>
          <CSelect id="shippingMode" disabled={!availableOptions.length} onChange={handleSelectValueChange}>
            <option value="">Selecione ...</option>
            {availableOptions.map((shippingMode) => {
              return (
                <option key={shippingMode.value} value={shippingMode.value}>
                  {shippingMode.name}
                </option>
              );
            })}
          </CSelect>
        </CCardBody>
      </Card>
    </Col>
  );
};

export default ShippingModeSelect;
