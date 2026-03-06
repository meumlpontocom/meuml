import React, { useMemo } from "react";
import Inputs from "./Inputs";
import EditionPopup from "../EditionPopup";
import { useSelector } from "react-redux";
import ButtonComponent from "src/components/ButtonComponent";

export default function EditBtn({ id }) {
  const adverts = useSelector(state => state.advertsReplication.adverts);
  const thumbnail = useMemo(() => adverts.filter(advert => advert.id === id)[0]?.thumbnail, [id, adverts]);

  return (
    <EditionPopup title="Editar Anúncio" advertThumb={thumbnail} input={<Inputs id={id} />}>
      <ButtonComponent title="Editar" icon="cil-pencil" />
    </EditionPopup>
  );
}
