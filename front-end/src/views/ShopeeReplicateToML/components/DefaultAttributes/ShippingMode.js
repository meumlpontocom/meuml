import React, { useCallback, useContext, useMemo } from "react";
import { v4 }                                      from "uuid";
import Container                                   from "./Container";
import { CSelect }                                 from "@coreui/react";
import shopeeReplicateToMLContext                  from "../../shopeeReplicateToMLContext";
import useTranslateShippingModeName                from "src/helpers/translateShippingModeName";

const ShippingMode = () => {
  const translate                           = useTranslateShippingModeName();
  const { selectedAccounts, form, setForm } = useContext(shopeeReplicateToMLContext);

  const shippingModes = useMemo(() => {
    return selectedAccounts.reduce((shippingModeList, { shipping_modes }) => {
      const newState = {};
      shipping_modes.forEach(mode => {
        if (shippingModeList[mode]) newState[mode] = newState[mode] + 1;
        else newState[mode] = 1;
      });
      return newState;
    }, {});
  }, [selectedAccounts]);

  const currentReplicationAllowedShippingModes = useMemo(() => {
    const allowedShippingModesForThisReplication = [];
    for (const shippingMode in shippingModes) {
      if (Object.hasOwnProperty.call(shippingModes, shippingMode))
        if (shippingModes[shippingMode] === selectedAccounts.length)
          allowedShippingModesForThisReplication.push(shippingMode);
    }
    return allowedShippingModesForThisReplication;
  }, [selectedAccounts.length, shippingModes]);

  const handleChange = useCallback(
    ({ target: { value } }) => {
      setForm(p => ({ ...p, basic: { ...p.basic, shipping: { mode: value } } }));
    },
    [setForm],
  );

  const options = useMemo(() => {
    return currentReplicationAllowedShippingModes.map(shippingModeId => {
      return {
        id: v4(),
        name: translate(shippingModeId),
        value: shippingModeId,
      };
    });
  }, [currentReplicationAllowedShippingModes, translate]);

  return (
    <Container label="Modalidade do Frete" col={{ xs: 12, sm: 6 }}>
      <CSelect id="shippingMode" name="shippingMode" value={form.basic.shipping.mode} onChange={handleChange}>
        <option value="">Selecione...</option>
        {options.map(({ id, name, value }) => (
          <option value={value} key={id} id={id} name={name}>
            {name}
          </option>
        ))}
      </CSelect>
    </Container>
  );
};

export default ShippingMode;
