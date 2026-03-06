import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import EditionPopup from "../../EditionPopup";
import PriceCustomInput from "./PriceCustomInput";
import formatMoney from "../../../../../../../helpers/formatMoney";

export default function Price({ id }) {
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const { price } = useSelector((state) => {
    const { adverts } = state.advertsReplication;
    const advert = adverts.filter((advert) => advert.id === id);
    return advert[0];
  });
  const isSelected = useMemo(() => {
    const advert = selectedAdverts?.filter((advert) => advert.id === id);
    if (advert?.length) {
      return advert[0];
    } else return false;
  }, [selectedAdverts, id]);
  return (
    <EditionPopup
      id={id}
      title="Atualizar preço"
      input={<PriceCustomInput id={id} />}
      singular={true}
    >
      <span className="text-muted">
        <i className="cil-cash mr-1 ml-2" /> Preço:
        <span className="text-success">
          {" "}
          {isSelected ? formatMoney(isSelected.price) : formatMoney(price)}
        </span>
      </span>
    </EditionPopup>
  );
}
