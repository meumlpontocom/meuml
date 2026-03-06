import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCatalogSearchProduct }                                    from "../requests";
import { CatalogDisagree }                                              from "../molecules";
import { CCardBody }                                                    from "@coreui/react";
import { createMlAdvertContext }                                        from "../createMlAdvertContext";
import LoadingCardData                                                  from "src/components/LoadingCardData";
import {
  AlertCatalogModeration,
  AlertNoCatalogOptions,
  AlertNoVariationsAllowed,
  Card,
  CardHeader,
  ClassicPublishingSwitch,
  SelectCatalogOption,
} from "../atoms";

const Catalog = () => {
  const [isLoadingCatalogOptions, setIsLoadingCatalogOptions] = useState(false);
  const { form, catalogOptions, setCatalogOptions, setFormData } = useContext(createMlAdvertContext);
  const title = useMemo(() => form.title, [form.title]);
  const domainId = useMemo(() => form.selectedCategory.domain_id, [form.selectedCategory.domain_id]);
  const shouldRenderComponent = useMemo(
    () =>
      !!catalogOptions.length &&
      !!form.shippingMode &&
      form.condition === "new" &&
      form.listingType === "gold_pro",
    [catalogOptions.length, form.condition, form.listingType, form.shippingMode],
  );

  const updateCatalogSelectOptions = useCallback(() => {
    if (title && domainId) {
      (async () => {
        setIsLoadingCatalogOptions(true);
        const catalogSuggestionsResponse = await fetchCatalogSearchProduct({
          title,
          domainId,
        });
        if (catalogSuggestionsResponse.status === "success" && catalogSuggestionsResponse.data) {
          setCatalogOptions(catalogSuggestionsResponse.data);
          setFormData({ id: "createCatalogAdvert", value: true });
        }
        setIsLoadingCatalogOptions(false);
      })();
    }
  }, [domainId, setCatalogOptions, setFormData, title]);

  useEffect(() => {
    updateCatalogSelectOptions();
  }, [updateCatalogSelectOptions]);

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-catalog-card">
      <CardHeader title="Catálogo" subtitle={<span>Publicação no catálogo Mercado Livre&nbsp;</span>} />
      <CCardBody>
        {isLoadingCatalogOptions ? (
          <LoadingCardData />
        ) : form.variations.length ? (
          <AlertNoVariationsAllowed />
        ) : (
          <>
            <AlertNoCatalogOptions />
            <SelectCatalogOption />
            <ClassicPublishingSwitch />
            <CatalogDisagree />
            <AlertCatalogModeration />
          </>
        )}
      </CCardBody>
    </Card>
  );
};

export default Catalog;
