import React, { useContext } from "react";
import classNames from "classnames";
import { fetchCatalogCharts } from "../requests";
import { toast } from "react-toastify";
import { catalogChartsContext } from "../catalogChartsContext";
import ButtonComponent from "src/components/ButtonComponent";

export const SearchCatalogChartsBtn = () => {
  const {
    selectedAccount,
    selectedCategory,
    categoryRequiredAttributes,
    setCharts,
    setLoadingCatalogCharts,
    isLoadingCatalogCharts,
  } = useContext(catalogChartsContext);

  const btnClassName = classNames(["btn-dark", "btn-lg", "btn-block"]);

  async function searchCatalogCharts() {
    const attributes =
      categoryRequiredAttributes.length &&
      categoryRequiredAttributes.reduce((previous, current) => {
        if (current.value) {
          const selectedValue =
            current?.values?.length && current.values.filter(({ name }) => name === current.value);
          if (selectedValue?.length) {
            const sanitzedAttrbute = {
              ...current,
              value_id: selectedValue[0].id,
              value_name: selectedValue[0].name,
              values: selectedValue,
            };

            delete sanitzedAttrbute.value;
            delete sanitzedAttrbute.value_max_length;
            delete sanitzedAttrbute.value_type;

            return [...previous, sanitzedAttrbute];
          } else {
            const sanitizedAttribute = { ...current, values: [{ name: current.value }] };
            delete sanitizedAttribute.value;
            return [...previous, sanitizedAttribute];
          }
        } else {
          toast(`Você deve preencher o atributo ${current.name.toUpperCase()}`, {
            type: toast.TYPE.ERROR,
            autoClose: false,
          });
          return [...previous, "error"];
        }
      }, []);

    const payload = {
      account_id: selectedAccount[0].id,
      domain_id: selectedCategory.split("MLB-")[1],
      attributes: attributes,
    };

    if (payload.attributes.filter(i => i === "error").length) return;

    setLoadingCatalogCharts(true);
    const response = await fetchCatalogCharts({ payload });
    setCharts(response);
    setLoadingCatalogCharts(false);
  }

  return (
    <ButtonComponent
      color="dark"
      disabled={isLoadingCatalogCharts}
      title="Pesquisar tabelas"
      icon="cil-search"
      isLoading={isLoadingCatalogCharts}
      className={btnClassName}
      onClick={searchCatalogCharts}
      variant=""
      width="100%"
    />
  );
};
