import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import ReplicationInfoCard from "../../../components/ReplicationInfoCard";

const SelectedInfoWidgetCard = ({ history, selected }) => {
  const { selectedAdverts, selectedException, selectAll, meta } = useSelector(
    ({ advertsReplication }) => advertsReplication
  );
  const advertsMeta = useSelector((state) => state.advertsMeta);
  const { advertsArray, allChecked } = useSelector(
    (state) => state.selectedAdverts
  );

  const selectedData = useMemo(() => {
    const adverts = Object.values(advertsArray);
    if (!selectedAdverts.length && !selectAll) {
      const total = selected
        ? selected
        : allChecked
        ? advertsMeta.total - adverts.filter((ad) => !ad.checked).length
        : adverts.filter((ad) => ad.checked).length;
      return total;
    } else {
      if (selectAll) {
        return meta.total - selectedException.length;
      } else {
        return selectedAdverts.length;
      }
    }
  }, [
    advertsArray,
    advertsMeta,
    allChecked,
    meta,
    selectAll,
    selected,
    selectedAdverts,
    selectedException,
  ]);

  const redirectWhenNoneSelected = () => {
    if (selectedData === 0) history.goBack();
  };

  useEffect(() => {
    redirectWhenNoneSelected();
  }, []); //eslint-disable-line

  return (
    <ReplicationInfoCard title="anúncios selecionados" value={selectedData} />
  );
};

export default SelectedInfoWidgetCard;
