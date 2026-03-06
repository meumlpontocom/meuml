import React from "react";
import Callout from "src/components/Callout";
import formatMoney from "src/helpers/formatMoney";
import { useSelector } from "react-redux";

function EstimatedCoast() {
  const { total } = useSelector(({ shopee: { advertising } }) => advertising.pagination);
  const selectedAccountsLength = useSelector(({ accounts }) => accounts.selectedAccounts.length);
  const { selected, selectAll } = useSelector(({ shopee: { advertising } }) => advertising);

  const estimatedCoast = React.useMemo(() => {
    const coastPerAdvert = 0.25;
    const selectedAdsLength = Object.values(selected)
      .filter(({ checked }) => checked === true)
      .length;
    if (selectAll) {
      const selectedAds = total - Object.values(selected)
        .filter(({ checked }) => checked === false)
        .length;
        return formatMoney(coastPerAdvert * selectedAds * selectedAccountsLength);
    } else {
        return formatMoney(selectedAdsLength * coastPerAdvert * selectedAccountsLength);
    }
    return () => selectedAdsLength;
  }, [selectAll, selected, selectedAccountsLength, total]);

  return (
    <Callout
      color="primary"
      title="Custo estimado"
      value={estimatedCoast}
      col={{ xs: 12, sm: 4, md: 4, lg: 4 }}
      borders={true}
    />
  );
}

export default EstimatedCoast

