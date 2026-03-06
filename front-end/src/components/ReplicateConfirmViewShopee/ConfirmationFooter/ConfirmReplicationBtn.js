import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CButton } from "@coreui/react";
import { FaCheckDouble } from "react-icons/fa";
import useReplication from "../hooks/useReplication";
import { validateRequiredAttributes } from "../utils/validateShopeeRequiredAttributes";

const ConfirmReplicationBtn = () => {
  const replication = useReplication();
  const isLoading = useSelector(state => state.advertsReplication.isLoading);
  const availableCredits = useSelector(state => state.advertsReplication.availableCredits);
  const selectedAccounts = useSelector(state => state.advertsReplication.selectedAccounts);
  const selectedAdverts = useSelector(state => state.advertsReplication.selectedAdverts);

  const allAdsHaveProductDimension = selectedAdverts.every(advert => {
    const advertDimensions = advert?.advertData?.seller_package_dimensions ?? {};
    const advertHasAllDimensions = Object.values(advertDimensions).filter(value => !!value).length === 4;

    const inputDimensions = advert.dimension
      ? Object.values(advert.dimension).filter(value => !!value).length === 3
      : false;
    const inputWeight = !!advert.weight;
    const advertHasInputDimensions = inputDimensions && inputWeight;

    const isComplete = advert.categoryId && (advertHasAllDimensions || advertHasInputDimensions);

    return isComplete;
  });

  const isReplicationBtnDisabled = useMemo(() => {
    const requiredAttributesAreFilled = selectedAdverts.every(advert =>
      validateRequiredAttributes(advert.shopeeRequiredAttributes ?? []),
    );

    return (
      isLoading ||
      !availableCredits ||
      !allAdsHaveProductDimension ||
      selectedAccounts.length === 0 ||
      // !selectedAdverts.every(item => !!item.isComplete) ||
      !requiredAttributesAreFilled
    );
  }, [availableCredits, allAdsHaveProductDimension, isLoading, selectedAccounts.length, selectedAdverts]);

  return availableCredits ? (
    <CButton
      size="lg"
      color="success"
      style={{ float: "right" }}
      onClick={replication.submitRequest}
      disabled={isReplicationBtnDisabled}
    >
      Enviar pedido &nbsp; <FaCheckDouble />
    </CButton>
  ) : (
    <></>
  );
};

export default ConfirmReplicationBtn;
