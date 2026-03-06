import React from "react";
import FormPopup from "../../../../FormPopup";
import { useDispatch } from "react-redux";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import {
  saveFormPopupData,
  saveFormPopupUrl,
  fetchHeaderFooterFormPopUp
} from "../../../../../redux/actions";

export default function HeaderFooter({ advert }) {
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
      saveFormPopupUrl("/advertisings/mass-alter-header-footer?confirmed=0&select_all=0")
    );
  };
  const fetchHeaderFooterApi = () => {
    saveApiUrl();
    saveAdvertId();
    dispatch(fetchHeaderFooterFormPopUp());
  };
  return (
    <FormPopup
      btnTitle="Alterar Header / Footer"
      popupConfirmBtnText="Salvar Alteração"
      popupCancenlBtnText="Cancelar"
      disabled={false}
      popupTitle="Alterar Texto de Header & Footer"
      // popupType=""
      advert={advert}
      popupAction={() => fetchHeaderFooterApi()}
      inputArea={
        <>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-border-top mr-1" /> Cabeçalho
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="change-header-input"
              name="change-header-input"
              type="textarea"
              onChange={event =>
                handleInputChange({
                  label: "header",
                  value: event.target.value
                })
              }
            />
          </InputGroup>
          <br />
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-border-bottom mr-1" /> Rodapé
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="change-header-input"
              name="change-header-input"
              type="textarea"
              onChange={event =>
                handleInputChange({
                  label: "footer",
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
