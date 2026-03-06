import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";

export default async function replicateAdvert({
  priceActions,
  toggleLoading,
  confirmed,
  selectAll,
  searchType,
  query,
  selectedAccounts,
  selectedAdverts,
  selectedException,
  allow_duplicated_account,
  allow_duplicated_title,
  allow_copying_warranty,
  warrantType,
  warrantTime,
  bulkEdit,
  dispatch,
  create_without_warranty,
  selectedShippingMode,
  shipping_term,
  copyShippingTerm,
}) {
  try {
    toggleLoading();
    const url = `/advertisings/duplicate?confirmed=${confirmed}&select_all=${
      selectAll ? 1 : 0
    }&type=${searchType}&query=${query}`;
    const account_id = selectedAccounts.map(account => account.id);
    const advertisings = createAdvertObject({
      advertisings: selectedAdverts,
      selectedException,
      selectAll,
      bulkEdit,
      selectedShippingMode,
    });
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
          advertisings,
          allow_duplicated_account,
          allow_duplicated_title,
          allow_copying_warranty,
          mass_override,
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
        replicateAdvert({
          priceActions,
          toggleLoading,
          confirmed: 1,
          selectAll,
          searchType,
          query,
          selectedAccounts,
          selectedAdverts,
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
        });
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
  }
}

export function createAdvertObject({
  selectAll,
  advertisings,
  selectedException,
  selectedShippingMode,
  bulkEdit: { confirmed },
}) {
  if (!selectAll) {
    function validateObjectProperty({ object }) {
      if (object !== null) {
        if (typeof (object === "array" || typeof object === "object")) {
          if (object.length !== 0) return true;
          return false;
        }
        return false;
      }
      return false;
    }
    return advertisings.map((advert, index) => {
      let advertObject = {
        id: advert.id,
        override: {},
      };
      if (!confirmed) {
        for (const prop in advert) {
          if (advert.hasOwnProperty(prop)) {
            if (validateObjectProperty({ object: advert[prop] })) {
              if (prop === "shipping") {
                advertObject.override["shipping"] = {
                  free_shipping: advert[prop].free_shipping,
                  mode: selectedShippingMode,
                };
              } else {
                if (prop !== "sale_terms") advertObject.override[prop] = advert[prop];
              }
            }
          }
        }
        return { ...advertObject };
      } else return { ...advertObject };
    });
  } else return selectedException.map(advert => ({ id: advert }));
}

export function createSaleTermsArray({
  createWithoutWarranty,
  copyShippingTerm,
  shippingTerm,
  warrantTime,
  warrantType,
}) {
  if (createWithoutWarranty && copyShippingTerm) {
    return [];
  } else if (createWithoutWarranty && !copyShippingTerm) {
    return [
      {
        id: "MANUFACTURING_TIME",
        value_name: shippingTerm,
      },
    ];
  } else if (!createWithoutWarranty && copyShippingTerm) {
    return [
      {
        id: "WARRANTY_TIME",
        name: "Tempo de garantia",
        value_name: warrantTime,
      },
      {
        id: "WARRANTY_TYPE",
        name: "Tipo de garantia",
        value_name: warrantType,
      },
    ];
  } else {
    return [
      {
        id: "MANUFACTURING_TIME",
        value_name: shippingTerm,
      },
      {
        id: "WARRANTY_TIME",
        name: "Tempo de garantia",
        value_name: warrantTime,
      },
      {
        id: "WARRANTY_TYPE",
        name: "Tipo de garantia",
        value_name: warrantType,
      },
    ];
  }
}
