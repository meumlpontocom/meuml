import React, { useCallback }                         from "react";
import { useSelector, useDispatch }                   from "react-redux";
import { CCol, CInputGroup, CInputGroupText, CLabel } from "@coreui/react";
import NumberFormat                                   from "react-number-format";
import Input                                          from "reactstrap/lib/Input";
import InputGroupText                                 from "reactstrap/lib/InputGroupText";
import { savePriceActions }                           from "../../../redux/actions/_replicationActions";

export default function PriceUpdates() {
  const dispatch     = useDispatch();
  const priceActions = useSelector((state) => state.advertsReplication.priceActions);

  const updatePriceActions = useCallback(({ parameter, value }) => {
    dispatch(
      savePriceActions({
        parameter,
        value,
      }),
    );
  }, [dispatch]);

  return (
    <>
      <CLabel>Alteração de preço em massa</CLabel>
      <CCol style={{ paddingLeft: "0px" }}>
        <CInputGroup prepend className="mt-3">
          <CInputGroupText>
            <i className="cil-arrow-circle-top mr-1" />
            Subir / Baixar preço
            <i className="cil-arrow-circle-bottom ml-1" />
          </CInputGroupText>
          <select
            className="custom-select col-lg-6 col-md-6 col-sm-12 col-xs-12"
            onChange={({ target: { value } }) =>
              updatePriceActions({ parameter: "operation", value })
            }
          >
            <option value="select">Selecionar ...</option>
            <option value="increase">Subir preço</option>
            <option value="decrease">Baixar preço</option>
          </select>
        </CInputGroup>
        <CInputGroup prepend className="mt-3">
          <CInputGroupText>
            <span className="strong mr-1"> % </span>
            Porcentagem / Valor
            <span className="strong ml-1"> $ </span>
          </CInputGroupText>
          <select
            className="custom-select col-lg-6 col-md-6 col-sm-12 col-xs-12"
            onChange={({ target: { value } }) =>
              updatePriceActions({ parameter: "operationType", value })
            }
          >
            <option value="select">Selecionar ...</option>
            <option value="percentage">Porcentagem</option>
            <option value="value">Valor</option>
          </select>
        </CInputGroup>
        {priceActions.operationType === "percentage" ? (
          <CInputGroup prepend className="mt-3">
            <CInputGroupText>
              <span className="strong mr-1"> % </span>
              Porcentagem
            </CInputGroupText>
            <NumberFormat
              disabled={priceActions?.operationType === "select"}
              className="col-lg-6 col-md-6 col-sm-12 col-xs-12"
              onValueChange={(values) =>
                updatePriceActions({
                  parameter: "value",
                  value: values.floatValue,
                })
              }
              placeholder="Digite apenas numeros"
              value={priceActions?.value}
              customInput={Input}
              decimalSeparator="."
              fixedDecimalScale
              displayType="input"
              max={100.0}
              min={0.1}
              suffix="%"
              decimalScale={2}
              renderText={(value) => <div>{value}</div>}
              name="edit-percentage"
              id="edit-percentage"
            />
          </CInputGroup>
        ) : (
          <CInputGroup prepend className="mt-3">
            <InputGroupText>
              <i className="cil-cash mr-1" />
              Valor
            </InputGroupText>
            <NumberFormat
              disabled={priceActions?.operationType === "select"}
              className="col-lg-6 col-md-6 col-sm-12 col-xs-12"
              onValueChange={(values) =>
                updatePriceActions({
                  parameter: "value",
                  value: values.floatValue,
                })
              }
              placeholder="Digite apenas numeros"
              value={priceActions?.value}
              customInput={Input}
              decimalSeparator=","
              thousandSeparator="."
              fixedDecimalScale
              displayType="input"
              prefix="R$"
              decimalScale={2}
              renderText={(value) => <div>{value}</div>}
              name="edit-price"
              id="edit-price"
            />
          </CInputGroup>
        )}
      </CCol>
    </>
  );
}
