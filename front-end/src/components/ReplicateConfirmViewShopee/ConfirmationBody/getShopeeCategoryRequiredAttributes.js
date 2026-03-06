import { getToken } from "src/services/auth";

const { default: axios } = require("axios");

function formatAttributeValue(valueItem) {
  const attributeValueName =
    valueItem.multi_lang.find(lang => lang.language === "pt-BR")?.value || valueItem.name;

  return {
    id: valueItem.value_id,
    name: attributeValueName,
  };
}

function formatAttribute(attr) {
  const attributeName = attr.multi_lang.find(lang => lang.language === "pt-BR")?.value ?? attr.name;

  const attrInputType = attr.attribute_info.input_type;

  let inputType = "text"; // assumes value is 3
  if (attrInputType === 1 || attrInputType === 2) {
    inputType = "single";
  } else if (attrInputType === 4 || attrInputType === 5) {
    inputType = "multiple";
  }

  return {
    id: attr.attribute_id,
    name: attributeName,
    type: inputType,
  };
}

function formatRequiredAttributes(requiredAttributes) {
  const formattedAttributes = requiredAttributes.map(attr => {
    const attribute = formatAttribute(attr);

    const attributesValues = [];

    for (const attributeValue of attr.attribute_value_list ?? []) {
      const formattedAttributeValue = formatAttributeValue(attributeValue);

      if (attributeValue.child_attribute_list?.length > 0) {
        const childrenAttributes = formatRequiredAttributes(attributeValue.child_attribute_list);
        formattedAttributeValue.children = childrenAttributes;
      }

      attributesValues.push(formattedAttributeValue);
    }

    return {
      ...attribute,
      values_list: attributesValues,
      value: attribute.type === "multiple" ? [] : null,
    };
  });

  return formattedAttributes;
}

export async function getShopeeCategoryRequiredAttributes(categoriesIds) {
  const categoriesParam = categoriesIds.map(categoryId => categoryId.toString()).join(",");

  try {
    const response = await axios.get(
      ` ${process.env.REACT_APP_API_URL}/shopee/category/get-required-attributes`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
        params: { categories_ids: categoriesParam },
      },
    );

    const categoriesAttributes = response.data.data ?? {};

    const formattedAttributesByCategory = {};

    for (const categoryId of Object.keys(categoriesAttributes)) {
      const formattedAttributes = formatRequiredAttributes(categoriesAttributes[categoryId]);
      formattedAttributesByCategory[categoryId] = formattedAttributes;
    }

    console.log(
      "🚀 ~ getShopeeCategoryRequiredAttributes ~ formattedAttributesByCategory:",
      formattedAttributesByCategory,
    );
    return formattedAttributesByCategory;
  } catch (error) {
    console.log("error: ", error);
    return error;
  }
}
