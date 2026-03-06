import React, { useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router";
import { Provider } from "../shopeeReplicateToMLContext";
import useMLCategoryPredictor from "../hooks/useMLCategoryPredictor";
import useMLCategoriesTree from "../hooks/useMLCategoriesTree";
import useNavigateCategoriesTree from "../hooks/useNavigateCategoriesTree";

const ShopeeMlReplicationContext = ({ children }) => {
  const history = useHistory();
  const categoriesTree = useMLCategoriesTree();
  const [showAdvertPreview, setShowAdvertPreview] = useState(() => false);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [categoriesTreeNavigated, setCategoriesTreeNavigated] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [accountsOfficialStores, setAccountsOfficialStores] = useState([]);
  const [selectedOfficialStore, setSelectedOfficialStore] = useState(null);
  const [loadingOfficialStores, setLoadingOfficialStores] = useState(false);
  const [chartOptions, setChartOptions] = useState({});
  const [selectedChartOptions, setSelectedChartOptions] = useState("");
  const [selectedChartRow, setSelectedChartRow] = useState("");
  const [variationsAmount, setVariationsAmount] = useState(1);

  const adOriginalGtinAdjusted =
    history.location.state?.gtin_code && history.location.state?.gtin_code !== "00"
      ? history.location.state?.gtin_code
      : "";

  const [form, setForm] = useState({
    basic: {
      title: history.location.state?.name || "",
      description: history.location.state?.description || "",
      price: history.location.state?.price || 0,
      available_quantity: history.location.state?.stock || 1,
      condition: history.location.state?.condition.toLowerCase() || "new",
      listing_type_id: "",
      pictures: [],
      official_store_id: selectedOfficialStore ? selectedOfficialStore.id : null,
      pictures_shopee: [],
      create_classic_advertising: true,
      create_catalog_advertising: false,
      original_ad_gtin: adOriginalGtinAdjusted,
      gtin: adOriginalGtinAdjusted,
      gtin_behavior: "keep-original-gtin",
      shipping: { mode: "", free_shipping: false },
      sale_terms: [{ id: "MANUFACTURING_TIME", value: 0 }],
    },
    required: {},
    charts: {},
  });
  const [imgBeingUploaded, setImgBeingUploaded] = useState(() => null);
  const mlPredictedCategories = useMLCategoryPredictor(history.location.state?.name);
  const [isLoadingCategoryAttributes, categoryAttributes] = useNavigateCategoriesTree(
    selectedCategory.id || selectedCategory.category_id,
    setCategoriesTreeNavigated,
  );
  const resetStates = useCallback(() => {
    setCategoriesTreeNavigated([]);
    setSelectedCategory({ id: "" });
  }, [setCategoriesTreeNavigated, setSelectedCategory]);
  const requiredAttributes = useMemo(
    () =>
      (categoryAttributes.attributes && categoryAttributes.attributes.filter(({ tags }) => tags.required)) ||
      [],
    [categoryAttributes],
  );
  return (
    <Provider
      value={{
        imgBeingUploaded,
        setImgBeingUploaded,
        showAdvertPreview,
        setShowAdvertPreview,
        resetStates,
        mlPredictedCategories,
        selectedCategory,
        setSelectedCategory,
        categoriesTree,
        categoriesTreeNavigated,
        isLoadingCategoryAttributes,
        categoryAttributes,
        requiredAttributes,
        form,
        setForm,
        selectedAccounts,
        setSelectedAccounts,
        chartOptions,
        setChartOptions,
        selectedChartOptions,
        setSelectedChartOptions,
        selectedChartRow,
        setSelectedChartRow,
        accountsOfficialStores,
        setAccountsOfficialStores,
        selectedOfficialStore,
        setSelectedOfficialStore,
        loadingOfficialStores,
        setLoadingOfficialStores,
        variationsAmount,
        setVariationsAmount,
      }}
    >
      <div>{children}</div>
    </Provider>
  );
};

export default ShopeeMlReplicationContext;
