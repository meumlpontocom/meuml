import React from "react";
import FormPopup from "../../../../FormPopup";
import { useDispatch } from "react-redux";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import {
  saveFormPopupData,
  saveFormPopupUrl,
  fetchAlterTextFormPopup
} from "../../../../../redux/actions";

export default function AlterText({ advert }) {
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
      saveFormPopupUrl("/advertisings/mass-alter-text?confirmed=0&select_all=0")
    );
  };
  const fetchAlterTextApi = () => {
    saveApiUrl();
    saveAdvertId();
    dispatch(fetchAlterTextFormPopup());
  };
  return (
    <FormPopup
      btnTitle="Alterar Texto Fixo"
      popupConfirmBtnText="Salvar Alteração"
      popupCancenlBtnText="Cancelar"
      disabled={false}
      popupTitle="Alterar Texto Fixo"
      // popupType=""
      advert={advert}
      popupAction={() => fetchAlterTextApi()}
      inputArea={
        <>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-text-square mr-1" /> Texto
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="alter-text-input"
              name="alter-text-input"
              type="textarea"
              onChange={event =>
                handleInputChange({
                  label: "description",
                  value: event.target.value
                })
              }
            />
          </InputGroup>
        </>
      }
    />
  );
}
