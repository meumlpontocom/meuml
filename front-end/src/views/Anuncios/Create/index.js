import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchNavigateCategoryTree }               from "./requests";
import { Provider as ContextProvider }             from "./createMlAdvertContext";
import CreationForm                                from "./templates/CreationForm";
import ErrorBoundary                               from "src/components/ErrorBoundary";
import AdvertAbstraction                           from "./templates/AdvertAbstraction";

const advertCreationForm_initialState = {
  attributes: [],
  title: "",
  images: [],
  condition: "",
  price: "",
  description: "",
  selectedCategory: {
    attributes: [],
    category_id: null,
    category_name: null,
    domain_id: null,
    domain_name: null,
  },
  listingType: "",
  availableQuantity: "",
  catalogId: null,
  variations: [],
  createClassicAdvert: true,
  createCatalogAdvert: false,
  checkedMShopsAccounts: {},
  catalogCharts: { BRAND: {}, STANDARD: {}, SPECIFIC: {} },
  selectedChart: "",
  selectedChartRow: ""
};

function CreateMlAdvert() {
  // API payload form
  const [form, setForm] = useState(advertCreationForm_initialState);
  const setFormData = useCallback(({ id = "", value }) => {
    setForm(currentForm => ({ ...currentForm, [id]: value }));
  }, []);

  // Available catalog options brought by Mercado Livre's category predictor
  const [catalogOptions, setCatalogOptions] = useState(() => []);

  // Mercado Livre's advert category tree
  const [categoryTree, setCategoryTree] = useState(() => []);

  // Go to pre-publication step
  const [showAdvertAbstraction, setShowAdvertAbstraction] = useState(() => false);

  // Select variation menu at pre-publication
  const [selectedVariationId, setSelectedVariationId] = useState(() => "default");
  
  const [userTaggedOptionsAsInvalid, setUserTaggedOptionsAsInvalid] = useState(false);


  // Adapt "setFormData" to variations object structure
  const setVariation = useCallback(
    ({ variation }) => {
      setFormData({ id: "variations", value: [...form.variations, variation] });
    },
    [form.variations, setFormData],
  );

  // Fetch category tree endpoint; Save response data.
  useEffect(() => {
    (async () => {
      const selectedCategoryId = form.selectedCategory?.category_id;
      const fetchCategoryTree = async () => {
        return await fetchNavigateCategoryTree({
          categoryId: selectedCategoryId,
        });
      };
      const saveCategoryTree = ({ status, attributes }) => {
        status === "success" && setCategoryTree(attributes);
      };

      if (selectedCategoryId) {
        const categoryTreeResponse = await fetchCategoryTree();
        saveCategoryTree({
          status: categoryTreeResponse?.status,
          attributes: categoryTreeResponse?.data?.attributes,
        });
      }
    })();
  }, [form.selectedCategory.category_id]);

  const toggleCreateClassicAdvert = useCallback(
    () =>
      setFormData({
        id: "createClassicAdvert",
        value: !form.createClassicAdvert,
      }),
    [form.createClassicAdvert, setFormData],
  );

  const toggleCreateCatalogAdvert = useCallback(
    () =>
      setFormData({
        id: "createCatalogAdvert",
        value: !form.createCatalogAdvert,
      }),
    [form.createCatalogAdvert, setFormData],
  );

  const setDisableCatalogPublishing = useCallback((isChecked) => {
    setUserTaggedOptionsAsInvalid(isChecked);
  }, []);

  const isCatalogRequired = useMemo(() => {
    const visibleAttributes = categoryTree.filter(({ tags }) => !tags?.hidden);
    const requiredAttributes = visibleAttributes.filter(attribute => !!attribute.tags?.required);
    return !!requiredAttributes.filter(attribute => !!attribute.tags?.catalog_required)?.length;
  }, [categoryTree]);

  const catalogIsRequiredButNoOptionAvailable = useMemo(
    () => !catalogOptions.length && isCatalogRequired,
    [catalogOptions.length, isCatalogRequired],
  );
  const availableOptionsButUserOptedOut = useMemo(
    () => catalogOptions?.length && userTaggedOptionsAsInvalid,
    [catalogOptions?.length, userTaggedOptionsAsInvalid],
  );
  const shouldEvaluateModerationEligibility = useMemo(
    () => (catalogIsRequiredButNoOptionAvailable || availableOptionsButUserOptedOut ? true : false),
    [availableOptionsButUserOptedOut, catalogIsRequiredButNoOptionAvailable],
  );

  return (
    <ContextProvider
      value={{
        page: null,
        form,
        setFormData,
        catalogOptions,
        setCatalogOptions,
        categoryTree,
        setCategoryTree,
        setVariation,
        toggleCreateCatalogAdvert,
        toggleCreateClassicAdvert,
        showAdvertAbstraction,
        setShowAdvertAbstraction,
        setSelectedVariationId,
        selectedVariationId,
        userTaggedOptionsAsInvalid,
        setDisableCatalogPublishing,
        shouldEvaluateModerationEligibility
      }}
      displayName="Create ML Ad"
    >
      <ErrorBoundary>
        {!showAdvertAbstraction && <CreationForm />}
        {showAdvertAbstraction && <AdvertAbstraction />}
      </ErrorBoundary>
    </ContextProvider>
  );
}

export default CreateMlAdvert;
