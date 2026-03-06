import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import EditionPopup from "../../EditionPopup";
import ConditionCustomInput from "./ConditionCustomInput";

export default function Condition({ id }) {
  const { selectedAdverts } = useSelector((state) => state.advertsReplication);
  const { condition } = useSelector((state) => {
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
      title="Condição do produto"
      input={<ConditionCustomInput id={id} />}
      singular={true}
    >
      <span className="text-muted">
        <i className="cil-star mr-1 ml-2" /> Condição:
        <span
          className={`ml-2 text-${
            isSelected
              ? isSelected.condition === "new"
                ? "success"
                : isSelected.condition === "used"
                ? "warning"
                : "primary"
              : condition === "new"
              ? "success"
              : condition === "used"
              ? "warning"
              : "primary"
          }`}
        >
          {isSelected
            ? isSelected.condition === "new"
              ? "Novo"
              : isSelected.condition === "used"
              ? "Usado"
              : "-"
            : condition === "new"
            ? "Novo"
            : condition === "used"
            ? "Usado"
            : "-"}
        </span>
      </span>
    </EditionPopup>
  );
}
