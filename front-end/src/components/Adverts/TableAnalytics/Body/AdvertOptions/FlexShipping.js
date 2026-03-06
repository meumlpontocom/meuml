import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  saveFormPopupData,
  saveFormPopupUrl,
  fetchActivateFlexShipping,
  fetchDeactivateFlexShipping,
} from "../../../../../redux/actions";

export default function FlexShipping({ advert }) {
  const dispatch = useDispatch();
  const status = useMemo(() => {
    return advert?.shipping_tags?.filter((tag) => tag === "self_service_in")
      .length !== 0
      ? true
      : advert?.shipping_tags?.filter((tag) => tag === "self_service_out")
          .length !== 0
      ? false
      : null;
  }, [advert]);

  const saveAdvertId = () => {
    return dispatch(
      saveFormPopupData({ label: "advertId", value: advert.external_id })
    );
  };

  const saveApiUrl = () => {
    return dispatch(
      saveFormPopupUrl(
        "/shipping/mercado-envios-flex/change?select_all=0&confirmed=0"
      )
    );
  };

  const fetchFlexShippingStatus = () => {
    switch (status) {
      case true:
        saveApiUrl();
        saveAdvertId();
        dispatch(fetchDeactivateFlexShipping());
        break;
      case false:
        saveApiUrl();
        saveAdvertId();
        dispatch(fetchActivateFlexShipping());
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="dropdown-item"
      style={{ cursor: "pointer" }}
      onClick={() => fetchFlexShippingStatus()}
      hidden={status === null}
    >
      {status ? "Desativar" : "Ativar"} Envio Flex
    </div>
  );
}
