import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveSelectedAdvert } from "src/redux/actions/_replicationActions";
import { setShopeeCategoriesTree, setShopeeCategoriesTreeLoading } from "src/redux/actions/_shopeeActions";
import api from "src/services/api";
import { getShopeeCategoryRequiredAttributes } from "../ConfirmationBody/getShopeeCategoryRequiredAttributes";

const useCategories = () => {
  const dispatch = useDispatch();
  const categoriesTree = useSelector(state => state.shopee.categoriesTree.data);

  const handleGetCategoriesTree = useCallback(async () => {
    if (categoriesTree.length > 0) return;

    try {
      dispatch(setShopeeCategoriesTreeLoading(true));
      const url = "/shopee/categories-tree";
      const response = await api.get(url);
      if (response.data.statusCode === 200) {
        dispatch(setShopeeCategoriesTree(response.data.data));
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  }, [categoriesTree.length, dispatch]);

  const predictCategoryForSelectedAdverts = async ({ adverts, signal }) => {
    dispatch(setShopeeCategoriesTreeLoading(true));
    try {
      const promises = Object.values(adverts)
        .filter(advert => advert.checked)
        .map(async advert => {
          if (signal.aborted) throw new Error("Operation aborted");
          return handlePredictCategory(advert);
        });

      const advertsWithCategories = await Promise.all(promises);
      const categoriesIds = advertsWithCategories
        .filter(advert => !!advert.categoryId)
        .map(advert => advert.categoryId);

      const categoriesAttributesResponse = await getShopeeCategoryRequiredAttributes(categoriesIds);

      const advertsWithRequiredAttributes = advertsWithCategories.map(advert => {
        const requiredAttributes = categoriesAttributesResponse[advert.categoryId] ?? [];

        return {
          ...advert,
          shopeeRequiredAttributes: requiredAttributes,
        };
      });

      advertsWithRequiredAttributes.forEach(advert => {
        dispatch(saveSelectedAdvert(advert));
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setShopeeCategoriesTreeLoading(false));
    }
  };

  const handlePredictCategory = async advert => {
    const url = `/shopee/category-predictor?title=${advert.title}`;

    try {
      const response = await api.get(url);
      const predictedCategoryId = response?.data?.data?.category_id?.[0];

      const predictedData = categoriesTree?.find(category => {
        return category.category_id === predictedCategoryId;
      });

      const isCategoryLeaf = !predictedData?.has_children;
      let formattedCategoryRequiredAttributes = [];

      // if (isCategoryLeaf) {
      //   const response = await getShopeeCategoryRequiredAttributes([predictedCategoryId]);
      //   const data = response.data.data ?? {};

      //   const requiredAttributes = data[predictedCategoryId] ?? [];

      //   formattedCategoryRequiredAttributes = formatRequiredAttributes(requiredAttributes);
      // }

      const advertWithCategory = {
        ...advert,
        categoryId: isCategoryLeaf ? predictedCategoryId : undefined,
      };

      return advertWithCategory;

      // dispatch(
      //   saveSelectedAdvert({
      //     ...advert,
      //     categoryId: isCategoryLeaf ? predictedCategoryId : undefined,
      //     shopeeRequiredAttributes: formattedCategoryRequiredAttributes,
      //   }),
      // );
    } catch (error) {
      return {
        ...advert,
        categoryId: undefined,
      };

      // dispatch(
      //   saveSelectedAdvert({
      //     ...advert,
      //     categoryId: undefined,
      //     shopeeRequiredAttributes: [],
      //   }),
      // );
      console.error(error);
    }
  };

  return {
    handleGetCategoriesTree,
    handlePredictCategory,
    predictCategoryForSelectedAdverts,
  };
};

export default useCategories;
