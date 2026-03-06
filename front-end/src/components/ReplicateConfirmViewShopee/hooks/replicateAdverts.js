import api, { headers } from "src/services/api";
import Swal from "sweetalert2";

export default async function replicateAdvert({
  toggleLoading,
  confirmed,
  selectedAccounts,
  selectedAdverts,
  dispatch,
  weight,
  dimension,
  categoryId,
}) {
  try {
    toggleLoading();
    const url = `/shopee/advertisings/replicate/mercadolibre?confirmed=${confirmed}`;
    const account_id = selectedAccounts.map(account => account.id);

    const advertisings = createAdvertObject({
      advertisings: selectedAdverts,
      globalWeight: weight,
      globalDimension: dimension,
      globalCategoryId: categoryId,
    });

    const postObject = {
      type: "shopee_duplicate_advertising_list",
      attributes: {
        account_id,
        advertisings,
      },
    };

    const response = await api.post(url, postObject, headers);

    Swal.fire({
      title: "Atenção",
      html: `<p>${response.data.message}</p>`,
      type: !confirmed ? "question" : response.data.status,
      showCloseButton: true,
      showConfirmButton: true,
      showCancelButton: !confirmed,
      confirmButtonText: !confirmed ? "Confirmar" : "OK",
      cancelButtonText: "Cancelar",
    }).then(user => {
      if (user.value && !confirmed) {
        replicateAdvert({
          toggleLoading,
          confirmed: 1,
          selectedAccounts,
          selectedAdverts,
          dispatch,
          weight,
          dimension,
          categoryId,
        });
      }
      if (user.value && confirmed) {
        dispatch({ type: "REPLICATION_RESET_STORE" });
        window.location.href = "#/historico-replicacoes";
      }
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

/**
 * Converts the internal attribute tree format to Shopee API format.
 * Recursively processes children of selected values and flattens them into the output array.
 */
export function convertAttributesToShopeeFormat(attributes) {
  if (!attributes || attributes.length === 0) {
    return [];
  }

  const result = [];

  for (const attr of attributes) {
    const shopeeAttribute = {
      attribute_id: attr.id,
      attribute_value_list: [],
    };

    if (attr.type === "text") {
      // Text type: value_id is 0, original_value_name is the text value
      shopeeAttribute.attribute_value_list.push({
        value_id: 0,
        original_value_name: attr.value ?? "",
      });
    } else if (attr.type === "single") {
      // Single type: use value.value as value_id, value.label as original_value_name
      if (attr.value) {
        shopeeAttribute.attribute_value_list.push({
          value_id: attr.value.value,
          original_value_name: attr.value.label,
        });
      }
    } else if (attr.type === "multiple") {
      // Multiple type: map each item in value array to an entry in attribute_value_list
      if (Array.isArray(attr.value)) {
        for (const selectedValue of attr.value) {
          shopeeAttribute.attribute_value_list.push({
            value_id: selectedValue.value,
            original_value_name: selectedValue.label,
          });
        }
      }
    }

    result.push(shopeeAttribute);

    // Recursively process children of selected values
    if (attr.values_list && attr.values_list.length > 0) {
      for (const valueItem of attr.values_list) {
        if (valueItem.selected && valueItem.children && valueItem.children.length > 0) {
          const childrenConverted = convertAttributesToShopeeFormat(valueItem.children);
          result.push(...childrenConverted);
        }
      }
    }
  }

  return result;
}

export function createAdvertObject({ advertisings, globalWeight, globalDimension, globalCategoryId }) {
  return advertisings.map(advert => {
    const originalAdDimensions = advert?.advertData?.seller_package_dimensions ?? {};

    const originalAdHeight = originalAdDimensions.height
      ? Number(originalAdDimensions.height.split(" ")[0])
      : undefined;
    const originalAdWidth = originalAdDimensions.width
      ? Number(originalAdDimensions.width.split(" ")[0])
      : undefined;
    const originalAdLength = originalAdDimensions.length
      ? Number(originalAdDimensions.length.split(" ")[0])
      : undefined;
    const originalAdWeight = originalAdDimensions.weight
      ? Number(originalAdDimensions.weight.split(" ")[0])
      : undefined;

    const packageHeight = advert.dimension?.height || originalAdHeight;
    const packageWidth = advert.dimension?.width || originalAdWidth;
    const packageLength = advert.dimension?.length || originalAdLength;
    const packageWeight = (advert.weight || originalAdWeight) / 1000;

    let advertObject = {
      id: advert.id,
      account_id: advert.account_id,
      title: advert.title,
      category_id: advert.categoryId ? advert.categoryId : globalCategoryId,
      dimension: {
        package_height: parseFloat(packageHeight),
        package_length: parseFloat(packageWidth),
        package_width: parseFloat(packageLength),
      },
      weight: parseFloat(packageWeight),
      shopee_required_attributes: convertAttributesToShopeeFormat(advert.shopeeRequiredAttributes ?? []),
    };

    return advertObject;
  });
}
