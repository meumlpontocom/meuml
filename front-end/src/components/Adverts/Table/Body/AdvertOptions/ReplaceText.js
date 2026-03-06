import React from "react";
import FormPopup from "../../../../FormPopup";
import { useDispatch } from "react-redux";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import { saveFormPopupData, saveFormPopupUrl, fetchReplaceTextFormPopup } from "../../../../../redux/actions";

export default function ReplaceText({ advert }) {
  const dispatch = useDispatch();
  const handleInputChange = ({ label, value }) => {
    dispatch(saveFormPopupData({ label, value }));
  };
  const saveAdvertId = () => {
    return dispatch(saveFormPopupData({ label: "advertId", value: advert.external_id }));
  };
  const saveApiUrl = () => {
    return dispatch(saveFormPopupUrl("/advertisings/mass-replace-text?confirmed=0&select_all=0"));
  };
  const fetchReplaceTextApi = () => {
    saveApiUrl();
    saveAdvertId();
    dispatch(fetchReplaceTextFormPopup());
  };
  return (
    <FormPopup
      btnTitle="Substituir Texto"
      popupConfirmBtnText="Salvar Alteração"
      popupCancenlBtnText="Cancelar"
      disabled={false}
      popupTitle="Substituir Texto"
      advert={advert}
      popupAction={() => fetchReplaceTextApi()}
      inputArea={
        <>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-text-square mr-1" />
                Texto original
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="to-replace-text"
              name="toBeReplacedText"
              type="textarea"
              onChange={({ target: { value, name } }) =>
                handleInputChange({
                  label: name,
                  value: value,
                })
              }
            />
          </InputGroup>
          <br />
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-text-square" />
                Texto atualizado
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="replace-text-"
              name="replaceText"
              type="textarea"
              onChange={({ target: { value, name } }) =>
                handleInputChange({
                  label: name,
                  value: value,
                })
              }
            />
          </InputGroup>
        </>
      }
    />
  );
}
