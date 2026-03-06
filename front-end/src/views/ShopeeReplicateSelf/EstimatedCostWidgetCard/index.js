import React from "react";
import formatMoney from "src/helpers/formatMoney";
import { useSelector } from "react-redux";
import ReplicationInfoCard from "../../../components/ReplicationInfoCard";

const EstimatedCostWidgetCard = () => {
  const { total } = useSelector(({ shopee: { advertising } }) => advertising.pagination);
  const selectedAccountsLength = useSelector(({ accounts }) => accounts.selectedAccounts.length);
  const { selected, selectAll } = useSelector(({ shopee: { advertising } }) => advertising);

  const estimatedCost = React.useMemo(() => {
    const coastPerAdvert = 0.25;
    const selectedAdsLength = Object.values(selected).filter(({ checked }) => checked === true).length;
    if (selectAll) {
      const selectedAds = total - Object.values(selected).filter(({ checked }) => checked === false).length;
      return formatMoney(coastPerAdvert * selectedAds * selectedAccountsLength);
    } else {
      return formatMoney(selectedAdsLength * coastPerAdvert * selectedAccountsLength);
    }
  }, [selectAll, selected, selectedAccountsLength, total]);

  return <ReplicationInfoCard title="custo estimado" value={estimatedCost} />;
};

export default EstimatedCostWidgetCard;
