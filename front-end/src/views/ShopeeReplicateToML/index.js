import React, { useEffect } from "react";
import ShopeeMlReplicationContext from "./components/ShopeeMlReplicationContext";
import RedirectToShopeeAds from "./components/RedirectToShopeeAds";
import PageHeader from "src/components/PageHeader";
import Rendering from "./components/Rendering";
import AdvertPreview from "./components/AdvertPreview";
import SelectAccount from "./components/SelectAccount";
import ReplicationInfo from "./components/ReplicationInfo";
import SelectCategory from "./components/SelectCategory";
import SelectedCategory from "./components/SelectedCategory";
import RequiredAttributesForm from "./components/RequiredAttributesForm";
import DefaultAttributes from "./components/DefaultAttributes";
import ChartsRequiredAttributes from "./components/ChartsRequiredAttributes";
import Controllers from "./components/Controllers";
import SelectChart from "./components/SelectChart";
import ShopeeUserProductWarning from "src/components/ShopeeUserProductWarning";

const ShopeeReplicateToML = () => {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <ShopeeMlReplicationContext>
      <RedirectToShopeeAds />
      <PageHeader heading="Replicar anúncio Shopee" subheading="para conta Mercado Livre" />
      <ShopeeUserProductWarning />
      <Rendering>
        <AdvertPreview />
        <SelectAccount />
        <ReplicationInfo />
        <SelectCategory />
        <SelectedCategory />
        <RequiredAttributesForm />
        <DefaultAttributes />
        <ChartsRequiredAttributes />
        <SelectChart />
      </Rendering>
      <Controllers />
    </ShopeeMlReplicationContext>
  );
};

export default ShopeeReplicateToML;
