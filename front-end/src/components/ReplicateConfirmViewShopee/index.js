/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "../PageHeader";
import ConfirmationBody from "./ConfirmationBody";
import ConfirmationFooter from "./ConfirmationFooter";
import ConfirmationHeader from "./ConfirmationHeader";
import useCategories from "./hooks/useCategories";

const ReplicateConfirmViewShopee = () => {
  const { handleGetCategoriesTree, predictCategoryForSelectedAdverts } = useCategories();
  const selectedAdverts = useSelector(state => state.selectedAdverts.advertsArray);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function getCategoriesAndPredict() {
      try {
        await handleGetCategoriesTree();
        await predictCategoryForSelectedAdverts({ adverts: selectedAdverts, signal });
      } catch (error) {
        console.log(error);
      }
    }

    getCategoriesAndPredict();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      <PageHeader heading="Replicar Anúncios" subheading="Shopee" />
      <ConfirmationHeader />
      <ConfirmationBody />
      <ConfirmationFooter />
    </>
  );
};

export default ReplicateConfirmViewShopee;
