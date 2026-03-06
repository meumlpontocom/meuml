import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import TitleEditionPopup from "./TitleEditionPopup";
import CustomInput from "./CustomInput";
import checkAdvertOwner from "../../checkAdvertOwner";

export default function Title({ id }) {
  const { accounts } = useSelector((state) => state.accounts);
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const { permalink, title, seller_id, is_owner } = useSelector((state) => {
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
    <>
      <a
        className="h5 text-primary"
        style={{
          cursor: "pointer",
          textDecoration: "none",
        }}
        target="_blank"
        rel="noopener noreferrer"
        href={permalink}
      >
        {isSelected ? isSelected.title : title}
      </a>
      <span className="ml-2">
        ({checkAdvertOwner({ id, seller_id, accounts, is_owner })})
      </span>
      <TitleEditionPopup icon="pencil ml-1 h5" title="Novo título" id={id}>
        <CustomInput id={id} />
      </TitleEditionPopup>
    </>
  );
}
