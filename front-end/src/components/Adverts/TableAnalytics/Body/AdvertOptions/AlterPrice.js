import React from "react";
import FormPopup from "../../../../FormPopup";
import { useDispatch } from "react-redux";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import {
  saveFormPopupData,
  saveFormPopupUrl,
  fetchAlterPriceFormPopup
} from "../../../../../redux/actions";

export default function AlterPrice({ advert }) {
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
      saveFormPopupUrl("/advertisings/mass-alter-price?confirmed=0&select_all=0")
    );
  };
  const fetchAlterPriceApi = () => {
    saveApiUrl();
    saveAdvertId();
    dispatch(fetchAlterPriceFormPopup());
  };
  return (
    <FormPopup
      btnTitle="Alterar Preço"
      popupConfirmBtnText="Salvar Alteração"
      popupCancenlBtnText="Cancelar"
      disabled={false}
      popupTitle="Alterar Preço"
      // popupType=""
      advert={advert}
      popupAction={() => fetchAlterPriceApi()}
      inputArea={
        <>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="cil-dollar mr-1" /> Novo Valor
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="alter-priceRate"
              name="alter-priceRate"
              type="number"
              onChange={event =>
                handleInputChange({
                  label: "alterPrice",
                  value: Number(event.target.value)
                })
              }
            />
          </InputGroup>
        </>
      }
    />
  );
}
