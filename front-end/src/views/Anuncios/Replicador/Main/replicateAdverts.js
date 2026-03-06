import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "src/services/auth";

export default async function replicateAdvert({
  priceActions,
  toggleLoading,
  confirmed,
  selectAll,
  searchType,
  query,
  queryParams,
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
    let url = `/advertisings/duplicate?confirmed=${confirmed}&select_all=${selectAll ? 1 : 0}`;
    if (queryParams.nickname) url += `&nickname=${queryParams.nickname}`;
    if (queryParams.keyword) url += `&keyword=${queryParams.keyword}`;
    if (queryParams.category) url += `&category=${queryParams.category.id}`;

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

      if (mass_override.hasOwnProperty("ean")) {
        const ean = {
          id: "GTIN",
          value_name: bulkEdit.ean,
        };
        delete mass_override.ean;
        mass_override.attributes = mass_override.attributes?.length
          ? [...mass_override.attributes, ean]
          : [ean];
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

    const userProductAccounts = response.data.data?.accounts?.length ?? 0;
    const totalProductsVariations = response.data.data?.variations?.reduce((acc, curr) => {
      return acc + curr.variations_count;
    }, 0);

    // anuncios tem variações, e alguma conta de destino tem o User Product Ativado
    if (userProductAccounts > 0 && totalProductsVariations > 0) {
      const totalProducts = advertisings.length;
      const regularAccounts = selectedAccounts.length - userProductAccounts;

      const totalReplications =
        totalProductsVariations * userProductAccounts + totalProducts * regularAccounts;

      const formattedTotalValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalReplications * 0.25);

      Swal.fire({
        title: "Atenção",
        type: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        html: `<div> 
          <p style="text-align:start">${response.data.data?.description} </p>
          <p style="text-align:start">Clique em Continuar para ver mais detalhes </p>
        </div>`,
      })
        .then(user => {
          if (user.dismiss) return;

          Swal.fire({
            title: "Atenção",
            html: `<div>
            <p>${response.data.message}</p>
            ${
              response.data &&
              `
                <hr />
                <p> <b>Variações dos anuncios</b> </p>
                <p>
                  ${response.data.data.variations?.map(variation => {
                    return `<span style="text-align:start; margin-bottom: 3px; display: block;">
                      ${variation.ad_title} = <b>${variation.variations_count} variações</b>; </br>
                    </span>`;
                  })}
                </p>

                <span style="display: block; text-align: start; margin-top: 10px"> Em cada conta com User Products, serão gerados <b>${totalProductsVariations} anuncios </b> </span>

                <hr />
                <p> <b> Contas com user Product </b> </p>
                <p style="text-align: start; margin-bottom: 10px">
                  ${response.data.data.accounts?.map(
                    account =>
                      `<span style="text-align:start; margin-right: 10px">
                        ${account.account_name}
                      </span>`,
                  )}
                </p>

                <span style="text-align: start; display: block; margin-top: 15px"> Total de ${userProductAccounts} conta(s) <b>com</b> User Product </span>
                <span style="text-align: start; display: block; margin-top: 8px"> Total de ${regularAccounts} conta(s) <b>sem</b> User Product </span>

                <hr />

                <p> <b>Serão gerados</b> </p> 
                <span style="text-align:start; display: block; margin-top: 5px;">
                  <b>${totalProductsVariations} anuncios </b> de User Products em <b> ${userProductAccounts} conta(s) </b> com User Product;
                </span> </br>

                ${
                  regularAccounts > 0
                    ? `<span style="text-align:start; display: block; margin-top: 15px;">
                  <b>${totalProducts} anuncios </b> em <b>${regularAccounts} conta(s)</b> sem User Product
                </span> </br>`
                    : ``
                }

                <span style="display: block; text-align: start; margin-top: 10px"> Valor total da Replicação: <span style="color:#ad0000; font-weight: bold"> ${formattedTotalValue} </span> </span>
                `
            }
          </div>`,
            type: !confirmed ? "question" : response.data.status,
            showCloseButton: true,
            showConfirmButton: true,
            showCancelButton: !confirmed,
            confirmButtonText: !confirmed ? "Confirmar" : "OK",
            cancelButtonText: "Cancelar",
          })
            .then(user => {
              if (user.value && !confirmed) {
                replicateAdvert({
                  priceActions,
                  toggleLoading,
                  confirmed: 1,
                  selectAll,
                  searchType,
                  query,
                  queryParams,
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
            })
            .catch(() => {});
        })
        .catch();
    } else {
      // Anuncios normais sendo passados pra contas normais (USer PRoduct não está envolvido)
      Swal.fire({
        title: "Atenção",
        html: `<div>
        <p>${response.data.message}</p>
      </div>`,
        type: !confirmed ? "question" : response.data.status,
        showCloseButton: true,
        showConfirmButton: true,
        showCancelButton: !confirmed,
        confirmButtonText: !confirmed ? "Confirmar" : "OK",
        cancelButtonText: "Cancelar",
      })
        .then(user => {
          if (user.value && !confirmed) {
            replicateAdvert({
              priceActions,
              toggleLoading,
              confirmed: 1,
              selectAll,
              searchType,
              query,
              queryParams,
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
        })
        .catch(() => {});
    }
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
          return object.length !== 0;
        }
        return false;
      }
      return false;
    }

    let eanOnVariation = false;
    return advertisings.map(advert => {
      let advertObject = {
        id: advert.id,
        account_id: advert.account,
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
              } else if (prop === "variations" && advert.ean) {
                // eslint-disable-next-line no-loop-func -- eanOnVariation is intentionally shared across loop iterations as a flag
                advertObject.override["variations"] = [...advert.variations].map(variation => {
                  eanOnVariation = true;
                  if (variation.attributes) {
                    return {
                      ...variation,
                      attributes: [
                        ...variation.attributes,
                        {
                          id: "GTIN",
                          value_name: advert.ean,
                        },
                      ],
                    };
                  } else {
                    return {
                      ...variation,
                      attributes: [
                        {
                          id: "GTIN",
                          value_name: advert.ean,
                        },
                      ],
                    };
                  }
                });
              } else {
                if (prop !== "sale_terms") {
                  if (prop === "ean") {
                    if (!eanOnVariation) {
                      advertObject.override["attributes"] = [
                        {
                          id: "GTIN",
                          value_name: advert[prop],
                        },
                        ...advertObject.override["attributes"],
                      ];
                      delete advertObject.override["ean"];
                    }
                  } else {
                    advertObject.override[prop] = advert[prop];
                  }
                }
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
