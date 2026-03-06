import React from "react";
import { useSelector } from "react-redux";
import EditionPopup from "../../EditionPopup";
import FreeShippingCustomInput from "./FreeShippingCustomInput";

export default function FreeShipping({ id }) {
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const {
    shipping: { free_shipping },
  } = useSelector((state) => {
    const { adverts } = state.advertsReplication;
    const advert = adverts.filter((advert) => advert.id === id);
    return advert[0];
  });

  const selectedAdvert = selectedAdverts.filter(
    (advert) => advert.id === id
  )[0];

  return (
    <EditionPopup
      id={id}
      title="Frete Grátis"
      input={<FreeShippingCustomInput />}
      singular={true}
    >
      <span className="text-muted">
        <i className="cil-truck mr-1 ml-2" /> Frete Grátis:
        <span
          className={`${
            selectedAdvert
              ? selectedAdvert.shipping.free_shipping
                ? "text-success"
                : "text-danger"
              : free_shipping
              ? "text-success"
              : "text-danger"
          }`}
        >
          {selectedAdvert
            ? selectedAdvert.shipping.free_shipping
              ? " Sim"
              : " Não"
            : free_shipping
            ? " Sim"
            : " Não"}
        </span>
      </span>
    </EditionPopup>
  );
}
