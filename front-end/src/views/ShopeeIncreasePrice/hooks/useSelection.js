import { useMemo }     from "react";
import { useSelector } from "react-redux";

const useSelection = () => {
  const selected    = useSelector((reduxStore) => reduxStore.shopee.advertising.selected);
  const selectAll   = useSelector((reduxStore) => reduxStore.shopee.advertising.selectAll);
  const list        = useSelector((reduxStore) => reduxStore.shopee.advertising.list);
  const selectedAds = useMemo(() => selectAll 
    ? [] 
    :  Object.values(selected).filter(advert => advert.checked === true)
  , [selectAll, selected]);
  const exceptions = useMemo(() => Object.values(selected)
    .filter(advert => advert.checked === false)
  , [selected]);
  return { selectedAds, selectAll, exceptions, list }
}

export default useSelection;
