import React, { useMemo } from "react";
import { useSelector }    from "react-redux";
import useSelection       from "../../hooks/useSelection";

const SelectedInfo = () => {
  const { selectedAds, selectAll, exceptions } = useSelection();
  const pagination = useSelector((reduxStore) => reduxStore.shopee.advertising.pagination);
  const selected   = useMemo(() => 
    selectAll
      ? exceptions.length
        ? pagination.total - exceptions.length
        : "Todos"
      : selectedAds.length
  , [exceptions.length, pagination.total, selectAll, selectedAds.length]);
  return (
    <h5>
      Anúncios selecionados: {selected}
    </h5>
  );
}

export default SelectedInfo;
