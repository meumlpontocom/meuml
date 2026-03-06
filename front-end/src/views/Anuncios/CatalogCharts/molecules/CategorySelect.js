import React, { useContext, useEffect, useMemo }  from "react";
import { fetchRequiredCategoryAttributes }        from "../requests";
import CardHeader                                 from "../atoms/CardHeader";
import { CCard, CCardBody, CCardFooter, CSelect } from "@coreui/react";
import { catalogChartsContext }                   from "../catalogChartsContext";
import LoadingCardData                            from "src/components/LoadingCardData";

export default function CategorySelect() {
  const {
    selectedCategory,
    setCategory,
    predictedCategories,
    isLoadingRequiredAttributes,
    setLoadingRequiredAttributes,
    setRequiredAttributes,
  } = useContext(catalogChartsContext);

  const singleOption = useMemo(() => predictedCategories.length === 1, [predictedCategories]);

  function handleValueChange(event) {
    const {
      target: { value },
    } = event;
    setCategory(value);
  }

  useEffect(() => {
    predictedCategories.length === 1 && setCategory(predictedCategories[0].domain_id);
  }, [predictedCategories, setCategory]);

  useEffect(() => {
    (async () => {
    if (typeof selectedCategory === "string") {
      setLoadingRequiredAttributes(true);
      const requiredAttributes = await fetchRequiredCategoryAttributes({ selectedCategory });
      if (requiredAttributes.length) setRequiredAttributes(requiredAttributes);
      setLoadingRequiredAttributes(false);
    }
    })();
  }, [selectedCategory, setLoadingRequiredAttributes, setRequiredAttributes]);

  return predictedCategories.length ? (
    <CCard>
      <CardHeader text="Selecionar categoria" />
      <CCardBody>
        <CSelect
          disabled={singleOption}
          size="lg"
          value={selectedCategory}
          onChange={handleValueChange}
          id="predicted-category-select"
          name="predicted-category-select"
        >
          <option value={{}}>Selecionar ...</option>
          {predictedCategories.map(({ category_id, category_name, domain_id }) => (
            <option key={category_id} id={category_id} name={category_name} value={domain_id}>
              {category_name}
            </option>
          ))}
        </CSelect>
      </CCardBody>
      {isLoadingRequiredAttributes && (
        <CCardFooter className="text-center">
          <LoadingCardData />
        </CCardFooter>
      )}
    </CCard>
  ) : (
    <></>
  );
}
