import React from "react";
import FormPopup from "../../../../FormPopup";
import { useDispatch } from "react-redux";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import {
  saveFormPopupData,
  saveFormPopupUrl,
  fetchAlterManufacturingTime,
} from "../../../../../redux/actions";

export default function AlterManufacturingTime({ advert }) {
  const dispatch = useDispatch();
  const handleInputChange = ({ label, value }) => {
    dispatch(saveFormPopupData({ label, value }));
  };
  const saveAdvertId = () => {
    return dispatch(
      saveFormPopupData({ label: "advertId", value: advert.external_id })
    );
  };
  const saveApiUrl = () => {
    return dispatch(
      saveFormPopupUrl(
        "/advertisings/mass-alter-manufacturing-time?confirmed=0&select_all=0"
      )
    );
  };
  const fetchAlterTextApi = () => {
    saveApiUrl();
    saveAdvertId();
    dispatch(fetchAlterManufacturingTime());
  };
  return (
    <FormPopup
      btnTitle="Prazo de Envio"
      popupConfirmBtnText="Salvar Alteração"
      popupCancenlBtnText="Cancelar"
      disabled={false}
      popupTitle="Prazo de Envio"
      // popupType=""
      advert={advert}
      popupAction={() => fetchAlterTextApi()}
      inputArea={
        <>
          <label htmlFor="alter-text-input" style={{ fontSize: "14px" }}>
            Prazo máximo de 45 dias.{" "}
            <small>(informe 0 para remover o prazo)</small>
          </label>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-calendar-check mr-1" /> Dias (em números)
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="alter-text-input"
              name="alter-text-input"
              type="number"
              onChange={(event) =>
                handleInputChange({
                  label: "days",
                  value: event.target.value,
                })
              }
            />
          </InputGroup>
        </>
      }
    />
  );
}
