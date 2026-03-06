// React & Redux
import React, { useEffect, useMemo }                    from "react";
import { useDispatch, useSelector }                     from "react-redux";
// Reactstrap
import Label                                            from "reactstrap/lib/Label";
import InputGroup                                       from "reactstrap/lib/InputGroup";
import InputGroupAddon                                  from "reactstrap/lib/InputGroupAddon";
import InputGroupText                                   from "reactstrap/lib/InputGroupText";
import { saveSelectedShippingMode, saveShippingModes }  from "../../../redux/actions/_replicationActions";

export default function ShippingMode() {
  const dispatch = useDispatch();
  const { accounts } = useSelector((state) => state.accounts);
  const { shippingModes, selectedAccounts } = useSelector(
    (state) => state.advertsReplication
  );
  const mercadoLibreAccounts = useMemo(() => {
    return Object.values(accounts)
      .filter(
        account => account.internal_status === 1 && account.platform === "ML"
      );
  }, [accounts]);

  const selectShippingMode = (value) =>
    dispatch(saveSelectedShippingMode(value));

  useEffect(() => {
    const availableOptions = selectedAccounts.reduce(function (_shippingModes, account) {
      const { shipping_modes } = account;
      if (!_shippingModes.length) {
        return shipping_modes.map(String);
      }
      else {
        let update = [];
        _shippingModes.forEach(mode => {
          if (shipping_modes.find(modeName => modeName === mode)) {
            update.push(mode);
          }
        });
        return update;
      }
    }, []);

    dispatch(saveShippingModes(availableOptions))

  }, [dispatch, mercadoLibreAccounts, selectedAccounts]);

  return (
    <>
      <Label htmlFor="warranty-time">Modalidade do frete</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-truck mr-1" />
          </InputGroupText>
        </InputGroupAddon>
        <select
          disabled={!shippingModes.length || !selectedAccounts.length}
          className="custom-select col-lg-5 col-md-4 col-sm-4 col-xs-6"
          onChange={({ target: { value } }) => selectShippingMode(value)}
        >
          <option value="Selecione...">Selecione...</option>
          {shippingModes?.map((mode) => {
            return (
              <option value={mode} key={mode}>
                {mode === "custom"
                  ? "Frete Personalizado"
                  : mode === "not_specified"
                    ? "Não especificado"
                    : mode === "me2"
                      ? "Mercado Envios"
                      : mode}
              </option>
            );
          })}
        </select>
        {!shippingModes.length && selectedAccounts.length ? (
          <small className="text-danger mt-1">
            As contas selecionadas não possuem uma mesma modalidade de envio.
          </small>
        ) : (
            <></>
          )}
      </InputGroup>
    </>
  );
}
