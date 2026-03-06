import React, { useContext, useMemo } from "react";
import { CLabel, CSelect }            from "@coreui/react";
import { createMlAdvertContext }      from "../createMlAdvertContext";

const SelectCatalogOption = () => {
  const {
    catalogOptions,
    setFormData,
    form: { variations, listingType, condition },
  } = useContext(createMlAdvertContext);

  const disabled = useMemo(() => {
    return variations.length || listingType !== "gold_pro" || condition !== "new";
  }, [condition, listingType, variations.length]);

  function handleChange(event) {
    const {
      target: { id, value },
    } = event;
    setFormData({ id, value });
  }

  return catalogOptions.length ? (
    <>
      <CLabel htmlFor="catalogId">Opções de catálogo para esta publicação</CLabel>
      <CSelect id="catalogId" disabled={disabled} name="advert-catalog-select" onChange={handleChange}>
        <option value="">Selecione ...</option>
        {catalogOptions.map(catalogOption => (
          <option key={catalogOption.id} id={catalogOption.id} value={catalogOption.id}>
            {catalogOption.name}
          </option>
        ))}
      </CSelect>
    </>
  ) : (
    <></>
  );
};

export default SelectCatalogOption;
