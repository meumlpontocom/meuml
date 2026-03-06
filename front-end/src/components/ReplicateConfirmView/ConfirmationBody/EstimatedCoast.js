import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CCallout, CCol } from "@coreui/react";
import axios from "axios";
import { getToken } from "src/services/auth";
import Loading from "react-loading";

export default function EstimatedCoast() {
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);

  const selectedAccounts = useSelector(state => state.advertsReplication.selectedAccounts);
  const advertsArray = useSelector(state => state.selectedAdverts.advertsArray);
  const allChecked = useSelector(state => state.selectedAdverts.allChecked);
  const advertsMeta = useSelector(state => state.advertsMeta);
  const url = useSelector(state => state.advertsURL);

  function calculateTotalOfVariations() {
    const selectedAds = Object.values(advertsArray).filter(advert => advert.checked);

    let productsVariations = 0;
    let productsWithoutVariation = 0;

    for (const selectedAd of selectedAds) {
      const variations = selectedAd.advertData?.external_data?.variations ?? [];

      if (variations.length === 0) {
        productsWithoutVariation += 1;
        continue;
      }

      const isVariationValid = (variations[0].attribute_combinations ?? []).length > 0;

      if (!isVariationValid) {
        productsWithoutVariation += 1;
        continue;
      }

      productsVariations += variations.length;
    }

    return [productsVariations, productsWithoutVariation];
  }

  async function calculateTotalForAllChecked(userProductAccountsAmount, regularAccountsAmount) {
    if (userProductAccountsAmount === 0) {
      const totalAds = advertsMeta.total;
      const totalPrice = totalAds * selectedAccounts.length * 0.25;
      const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        totalPrice,
      );
      setEstimatedCost(formattedPrice);
    } else {
      try {
        console.log("fetching from backend");
        const fullUrl = `${url}&regular_accounts_amount=${regularAccountsAmount}&user_product_accounts_amount=${userProductAccountsAmount}`;

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/advertisings/get_replication_cost?${fullUrl}`,
          { headers: { Authorization: `Bearer ${getToken()}` } },
        );
        const totalPrice = response.data.data.total_cost;
        const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
          totalPrice,
        );
        setEstimatedCost(formattedPrice);
      } catch (error) {
        setEstimatedCost(null);
      }
    }
  }

  const calculateEstimatedCost = useCallback(async function calculateEstimatedCost() {
    setIsLoadingCost(true);
    const selectedAds = Object.values(advertsArray).filter(advert => advert.checked);
    const selectedAdsAmount = selectedAds.length;
    let totalPrice = 0;

    const userProductAccountsAmount = (
      selectedAccounts
        ? selectedAccounts.filter(account => {
            const accountTags = account.external_data?.tags ?? [];
            return accountTags.includes("user_product_seller");
          })
        : []
    ).length;

    const regularAccountsAmount = selectedAccounts.length - userProductAccountsAmount;

    if (allChecked) {
      await calculateTotalForAllChecked(userProductAccountsAmount, regularAccountsAmount);
      setIsLoadingCost(false);
      return;
    }

    if (userProductAccountsAmount > 0) {
      const [productsVariations, productsWithoutVariation] = calculateTotalOfVariations();

      const totalProductsToBeReplicatedPerAccount = productsVariations + productsWithoutVariation;
      const totalProductsToBeReplicated = userProductAccountsAmount * totalProductsToBeReplicatedPerAccount;
      const regularTotalToBeReplicated = regularAccountsAmount * selectedAdsAmount;

      totalPrice = (totalProductsToBeReplicated + regularTotalToBeReplicated) * 0.25;
    } else {
      totalPrice = selectedAdsAmount * selectedAccounts.length * 0.25;
    }

    const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      totalPrice,
    );
    setEstimatedCost(formattedPrice);
    setIsLoadingCost(false);
  }, [allChecked, advertsArray, selectedAccounts, calculateTotalForAllChecked, calculateTotalOfVariations]);

  useEffect(() => {
    calculateEstimatedCost();
  }, [calculateEstimatedCost]);

  return (
    <CCol xs={12} sm={4}>
      <CCallout color="primary">
        <small className="text-muted">Custo estimado:</small>
        <br />
        <span></span>
        {isLoadingCost ? (
          <Loading type="bars" color={"#054785"} height={30} width={30} />
        ) : !!estimatedCost ? (
          <strong className="h4">{estimatedCost}</strong>
        ) : (
          <strong className="h4">Selecione uma conta</strong>
        )}
      </CCallout>
    </CCol>
  );
}
