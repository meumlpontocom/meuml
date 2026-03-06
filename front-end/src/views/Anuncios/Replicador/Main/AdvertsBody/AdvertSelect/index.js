import React, { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import context from "../../advertReplicationContext";

export default function AdvertSelect({ id }) {
  const { selectAll, selectedAdverts, selectedException } = useSelector(state => state.advertsReplication);
  const { checkAdvert } = useContext(context);

  const checked = useMemo(() => {
    const inSelection = selectedAdverts.filter(ad => ad.id === id)?.length;
    const inException = selectedException.filter(_id => _id === id)?.length;
    if (inException) return false;
    else if (inSelection) return true;
    else if (selectAll) return true;
    else return false;
  }, [selectedAdverts, selectedException, selectAll, id]);

  return (
    <input
      id={id}
      type="checkbox"
      name="select-advert-input"
      checked={checked}
      onChange={({ target: { id, checked } }) => checkAdvert({ id, checked })}
    />
  );
}
