import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CCallout, CCol } from "@coreui/react";
import formatMoney from "../../../helpers/formatMoney";

export default function EstimatedCoast() {
  const selectedAdverts = useSelector(state => state.advertsReplication.selectedAdverts);
  const selectedException = useSelector(state => state.advertsReplication.selectedException);
  const selectAll = useSelector(state => state.advertsReplication.selectAll);
  const meta = useSelector(state => state.advertsReplication.meta);
  const selectedAccounts = useSelector(state => state.advertsReplication.selectedAccounts);
  const advertsArray = useSelector(state => state.selectedAdverts.advertsArray);
  const allChecked = useSelector(state => state.selectedAdverts.allChecked);
  const pagesAllChecked = useSelector(state => state.selectedAdverts.pagesAllChecked);
  const advertsMeta = useSelector(state => state.advertsMeta);

  const estimatedCoast = useMemo(() => {
    const coastPerAdvert = 0.25;
    const selectedAccountsAmount = selectedAccounts.length;
    const selectedAdsLength = Object.values(advertsArray).filter(advert => advert.checked).length;

    if (selectedAdsLength || allChecked || pagesAllChecked) {
      if (allChecked) {
        const unselectedAdverts = Object.values(advertsArray).filter(ad => !ad.checked).length;
        const adverts = advertsMeta.total - unselectedAdverts;

        return formatMoney(adverts * coastPerAdvert * selectedAccountsAmount);
      } else if (selectedAdsLength) {
        const _selectedAdsLength = Object.values(advertsArray)
          .filter(advert => advert.checked)
          .map(advert => advert.id).length;

        return formatMoney(_selectedAdsLength * coastPerAdvert * selectedAccountsAmount);
      } else return formatMoney(0);
    } else if (selectAll) {
      return formatMoney((meta.total - selectedException.length) * coastPerAdvert * selectedAccountsAmount);
    } else {
      return formatMoney(selectedAdverts.length * coastPerAdvert * selectedAccountsAmount);
    }
  }, [
    advertsArray,
    advertsMeta.total,
    allChecked,
    meta.total,
    pagesAllChecked,
    selectAll,
    selectedAccounts.length,
    selectedAdverts.length,
    selectedException.length,
  ]);

  return (
    <CCol xs={12} sm={4}>
      <CCallout color="primary">
        <small className="text-muted">Custo estimado:</small>
        <br />
        {selectedAccounts.length ? (
          <strong className="h4">{estimatedCoast}</strong>
        ) : (
          <strong className="h4">Selecione uma conta</strong>
        )}
      </CCallout>
    </CCol>
  );
}
