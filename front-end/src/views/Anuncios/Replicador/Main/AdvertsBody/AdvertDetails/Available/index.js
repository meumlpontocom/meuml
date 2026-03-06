import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import EditionPopup from "../../EditionPopup";
import AvailableCustomInput from "./AvailableCustomInput";

export default function AvailableQuantity({ id }) {
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const { available_quantity } = useSelector((state) => {
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
      title="Itens Disponíveis"
      input={<AvailableCustomInput id={id} />}
      singular={true}
    >
      <span className="text-muted">
        <i className="cil-layers mr-1 ml-2" /> Disponíveis:
        <span className="ml-2 text-primary">
          {isSelected ? isSelected.available_quantity : available_quantity}
        </span>
      </span>
    </EditionPopup>
  );
}
