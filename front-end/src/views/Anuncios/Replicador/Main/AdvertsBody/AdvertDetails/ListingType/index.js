import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import EditionPopup from "../../EditionPopup";
import ListingTypeCustomInput from "./ListingTypeCustomInput";

export default function ListingType({ id }) {
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const { listing_type_id } = useSelector((state) => {
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
      title="Tipo do anúncio"
      input={<ListingTypeCustomInput id={id} />}
      singular={true}
    >
      <span className="text-muted">
        <i className="cil-audio-description mr-1" /> Tipo do anúncio:
        <span
          className={`${
            isSelected
              ? isSelected.listing_type_id === "gold_pro"
                ? "text-success"
                : isSelected.listing_type_id === "gold_special"
                ? "text-primary"
                : "text-muted"
              : listing_type_id === "gold_pro"
              ? "text-success"
              : listing_type_id === "gold_special"
              ? "text-primary"
              : "text-muted"
          }`}
        >
          {isSelected
            ? isSelected.listing_type_id === "gold_special"
              ? " Clássico"
              : " Premium"
            : listing_type_id === "gold_special"
            ? " Clássico"
            : " Premium"}
        </span>
      </span>
    </EditionPopup>
  );
}
