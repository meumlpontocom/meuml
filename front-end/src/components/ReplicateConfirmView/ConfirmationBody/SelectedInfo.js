import React, { useMemo, useEffect, useCallback } from "react";
import { useSelector }                            from "react-redux";
import { CCallout, CCol }                         from "@coreui/react";

const SelectedInfo = ({ history, selected }) => {
  const selectedAdverts   = useSelector(state => state.advertsReplication.selectedAdverts);
  const selectedException = useSelector(state => state.advertsReplication.selectedException);
  const selectAll         = useSelector(state => state.advertsReplication.selectAll);
  const meta              = useSelector(state => state.advertsReplication.meta);
  const advertsMeta       = useSelector(state => state.advertsMeta);
  const advertsArray      = useSelector(state => state.selectedAdverts.advertsArray);
  const allChecked        = useSelector(state => state.selectedAdverts.allChecked);

  const selectedData = useMemo(() => {
    const adverts = Object.values(advertsArray);
    if (!selectedAdverts.length && !selectAll) {
      return selected ? selected : allChecked
        ? advertsMeta.total - adverts.filter(ad => !ad.checked).length
        : adverts.filter(ad => ad.checked).length;
    } else {
      if (selectAll) return meta.total - selectedException.length;
      else return selectedAdverts.length;
    }
  }, [
    advertsArray, advertsMeta, allChecked,
    meta, selectAll, selected,
    selectedAdverts, selectedException
  ]);

  const redirectWhenNoneSelected = useCallback(() => {
    if (selectedData === 0) history.goBack();
  }, [history, selectedData]);

  useEffect(() => {
    redirectWhenNoneSelected();
  }, []); //eslint-disable-line

  return (
    <CCol xs={12} sm={4}>
      <CCallout color="warning">
        <small className="text-muted">Anúncios selecionados:</small><br />
        <strong className="h4">{selectedData}</strong>
      </CCallout>
    </CCol>
  );
}

export default SelectedInfo;
