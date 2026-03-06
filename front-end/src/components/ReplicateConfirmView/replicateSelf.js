import Swal from "sweetalert2";
import api from "../../services/api";
import { getToken } from "../../services/auth";
import { createSaleTermsArray } from "../../views/Anuncios/Replicador/Main/replicateAdverts";

export default async function replicateSelf({
  selectedAdvertsState,
  advertsFiltersState,
  priceActions,
  toggleLoading,
  confirmed = 0,
  selectedAccounts,
  selectedException,
  allow_duplicated_account,
  allow_duplicated_title,
  allow_copying_warranty,
  warrantType,
  warrantTime,
  create_without_warranty,
  bulkEdit,
  dispatch,
  selectedShippingMode,
  shipping_term,
  copyShippingTerm,
  history,
  filterString,
  replication_mode,
  selectedOfficialStore,
  gtin,
}) {
  try {
    toggleLoading();
    const { advertsArray, allChecked } = selectedAdvertsState;
    const selectAll = `select_all=${allChecked ? 1 : 0}`;
    const filters = Object.keys(advertsFiltersState).reduce((previous, filterName) => {
      if (!advertsFiltersState[filterName] || !Object.keys(advertsFiltersState[filterName]).length) {
        return previous;
      }
      if (!advertsFiltersState[filterName]?.value) {
        const values = Object.keys(advertsFiltersState[filterName]).map(
          selectedOption => advertsFiltersState[filterName][selectedOption].value,
        );
        return `${previous}&${filterName === "accounts" ? "filter_account" : filterName}=${values.join(",")}`;
      }
      return `${previous}&${filterName}=${advertsFiltersState[filterName].value}`;
    }, "");
    const url = `/advertisings/duplicate/self?confirmed=${confirmed}&${selectAll}&${filterString}&${filters}`;

    const account_id = selectedAccounts.map(account => account.id);

    let mass_override = {
      priceActions,
      shipping: {
        mode: selectedShippingMode,
      },
      sale_terms: createSaleTermsArray({
        createWithoutWarranty: create_without_warranty,
        shippingTerm: shipping_term,
        copyShippingTerm,
        warrantTime,
        warrantType,
      }),
    };

    if (priceActions.operation === "select") {
      delete mass_override.priceActions;
    }

    if (bulkEdit.confirmed) {
      mass_override = {
        ...mass_override,
        ...bulkEdit,
      };
      mass_override["shipping"] = {
        ...mass_override.shipping,
        mode: selectedShippingMode,
      };

      if (mass_override.shipping.free_shipping === "keep_original")
        delete mass_override.shipping.free_shipping;
      if (mass_override.listing_type_id === "keep_original") delete mass_override.listing_type_id;
      if (mass_override.available_quantity === null || mass_override.available_quantity === "keep_original")
        delete mass_override.available_quantity;
      if (mass_override.condition === "keep_original") delete mass_override.condition;
      if (mass_override.description === "") delete mass_override.description;

      if (mass_override.hasOwnProperty("confirmed")) {
        delete mass_override["confirmed"];
      }
    }

    const postObject = {
      data: {
        type: "duplicate_advertising_list",
        attributes: {
          account_id,
          advertisings: allChecked
            ? Object.values(advertsArray)
                .filter(advert => !advert.checked)
                .map(advert => ({
                  id: advert.id,
                  account_id: advert.account_id,
                  override: null,
                }))
            : Object.values(advertsArray)
                .filter(advert => advert.checked)
                .map(advert => ({
                  id: advert.id,
                  account_id: advert.account_id,
                  override: null,
                })),
          allow_duplicated_account,
          allow_duplicated_title,
          allow_copying_warranty,
          mass_override,
          replication_mode,
          selectedOfficialStore,
        },
      },
    };

    const response = await api.post(
      url,
      { ...postObject },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    Swal.fire({
      title: "Atenção",
      html: `<p>${response.data.message}</p>`,
      type: !confirmed ? "question" : response.data.status,
      showCloseButton: true,
      showConfirmButton: true,
      showCancelButton: !confirmed ? true : false,
      confirmButtonText: !confirmed ? "Confirmar" : "OK",
      cancelButtonText: "Cancelar",
    }).then(user => {
      if (user.value && !confirmed) {
        replicateSelf({
          selectedAdvertsState,
          advertsFiltersState,
          priceActions,
          toggleLoading,
          confirmed: 1,
          selectedAccounts,
          selectedException,
          allow_duplicated_account,
          allow_duplicated_title,
          allow_copying_warranty,
          warrantType,
          warrantTime,
          create_without_warranty,
          bulkEdit,
          dispatch,
          selectedShippingMode,
          shipping_term,
          copyShippingTerm,
          history,
          filterString,
          replication_mode,
          selectedOfficialStore,
        });

        history.push("/historico-replicacoes");
      }
      if (user.value && confirmed) dispatch({ type: "REPLICATION_RESET_STORE" });
    });
  } catch (error) {
    Swal.fire({
      title: "Atenção",
      html: `<p>${error.response ? error.response.data.message : error.message ? error.message : error}.</>`,
      type: "error",
      showCloseButton: true,
    });
  } finally {
    toggleLoading();
    // history.goBack();
  }
}
