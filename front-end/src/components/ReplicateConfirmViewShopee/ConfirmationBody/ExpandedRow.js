import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "reactstrap";
import SelectShopeeCategoriesTree from "src/components/SelectShopeeCategories";
import Skeleton from "src/components/SkeletonLoading";
import {
  setAdvertDimensionHeight,
  setAdvertDimensionLength,
  setAdvertDimensionWidth,
  setAdvertWeight,
  setRequiredAttributes,
  setSelectedCategory,
} from "src/redux/actions/_replicationActions";
import { RequiredAttributeInput } from "./RequiredAttributeInput";
import { getShopeeCategoryRequiredAttributes } from "./getShopeeCategoryRequiredAttributes";

/**
 * Immutably updates an attribute by id anywhere in the tree.
 * Walks through attributes and their nested values_list[].children recursively.
 * Returns a new tree with only the targeted attribute updated via the updater function.
 */
function updateAttributeTree(attributes, targetId, updater) {
  let changed = false;

  const updateAttrs = attrs =>
    attrs.map(attr => {
      let currentAttr = attr;

      // If this is the target attribute, apply the updater
      if (attr.id === targetId) {
        currentAttr = updater(attr);
        if (currentAttr !== attr) changed = true;
      }

      // If no values_list, return as-is
      if (!currentAttr.values_list || currentAttr.values_list.length === 0) {
        return currentAttr;
      }

      // Recursively update children in values_list
      let valuesChanged = false;
      const newValues = currentAttr.values_list.map(value => {
        if (!value.children || value.children.length === 0) {
          return value;
        }

        const newChildren = updateAttrs(value.children);
        if (newChildren !== value.children) {
          valuesChanged = true;
          return { ...value, children: newChildren };
        }

        return value;
      });

      if (!valuesChanged) {
        return currentAttr;
      }

      changed = true;
      return { ...currentAttr, values_list: newValues };
    });

  const result = updateAttrs(attributes);
  return changed ? result : attributes;
}

const ExpandedRow = ({ item }) => {
  const [loadingNewCategory, setLoadingNewCategory] = useState(false);

  const dispatch = useDispatch();
  const dimension = useSelector(state => state.advertsReplication?.dimension);
  const weight = useSelector(state => state.advertsReplication?.weight);
  const categoryId = useSelector(state => state.advertsReplication?.categoryId);
  const selectedAdverts = useSelector(state => state.advertsReplication?.selectedAdverts);
  const itemAdvert = selectedAdverts.filter(advert => advert.id === item.id)[0];

  const itemDimensions = itemAdvert?.advertData?.seller_package_dimensions ?? {};

  const itemHeight = itemDimensions.height ? Number(itemDimensions.height.split(" ")[0]) : undefined;
  const itemWidth = itemDimensions.width ? Number(itemDimensions.width.split(" ")[0]) : undefined;
  const itemLength = itemDimensions.length ? Number(itemDimensions.length.split(" ")[0]) : undefined;
  const itemWeight = itemDimensions.weight ? Number(itemDimensions.weight.split(" ")[0]) : undefined;

  const packagingHeight = itemAdvert?.dimension?.height || itemHeight || dimension.height;
  const packagingWidth = itemAdvert?.dimension?.width || itemWidth || dimension.width;
  const packagingLength = itemAdvert?.dimension?.length || itemLength || dimension.length;
  const packagingWeight = itemAdvert?.weight || itemWeight || weight;

  const hasPredictedCategory = !!(itemAdvert?.categoryId || categoryId);

  const handleSelectRequiredAttributes = useCallback(
    (attribute, selectedOption) => {
      const updatedAttributes = updateAttributeTree(item.shopeeRequiredAttributes, attribute.id, attr => {
        const isMultiple = attr.type === "multiple";

        let value;
        let selectedIds;

        if (isMultiple) {
          // Multiple selection: selectedOption is an array of {label, value} objects
          const selectedArray = Array.isArray(selectedOption) ? selectedOption : [];
          value = selectedArray;
          selectedIds = selectedArray.map(opt => opt.value);
        } else {
          // Single selection: selectedOption is a single {label, value} object or null
          value = selectedOption ?? null;
          selectedIds = selectedOption ? [selectedOption.value] : [];
        }

        // Mark values_list items as selected based on selectedIds
        const values_list = attr.values_list.map(v => ({
          ...v,
          selected: selectedIds.includes(v.id),
        }));

        return { ...attr, value, values_list };
      });

      dispatch(setRequiredAttributes({ id: item.id, requiredAttributes: updatedAttributes }));
    },
    [item.shopeeRequiredAttributes, item.id, dispatch],
  );

  const handleChangeRequiredAttribute = useCallback(
    (attribute, text) => {
      const updatedAttributes = updateAttributeTree(item.shopeeRequiredAttributes, attribute.id, attr => ({
        ...attr,
        value: text,
      }));

      dispatch(setRequiredAttributes({ id: item.id, requiredAttributes: updatedAttributes }));
    },
    [item.shopeeRequiredAttributes, item.id, dispatch],
  );

  async function handleSelectCategory(category) {
    setLoadingNewCategory(true);
    const categoryRequiredAttributes = await getShopeeCategoryRequiredAttributes([category.id]);

    const categoryAttributes = categoryRequiredAttributes[category.id];

    setLoadingNewCategory(false);
    dispatch(
      setSelectedCategory({
        id: item.id,
        categoryId: Number(category.id),
        shopeeRequiredAttributes: categoryAttributes,
      }),
    );
  }

  if (!itemAdvert)
    return (
      <Skeleton>
        <Skeleton.Line />
      </Skeleton>
    );

  return (
    <>
      <div className="my-3" style={{ display: "flex", gap: "3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <strong>
            Categoria <span className="text-danger">*</span>
          </strong>
          <SelectShopeeCategoriesTree
            placeholder="Selecionar categoria"
            selected={itemAdvert?.categoryId || categoryId}
            valid={!!itemAdvert?.categoryId}
            invalid={!itemAdvert?.categoryId}
            callback={handleSelectCategory}
            multipleSelection={false}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <strong>Dimensão</strong>
          <div className="mt-2" style={{ gap: "8px", display: "flex" }}>
            <div style={{ padding: 0 }}>
              <span>Altura (cm)</span> <span className="text-danger">*</span>
              <Input
                type="number"
                style={{ width: "100px" }}
                value={packagingHeight}
                valid={packagingHeight > 0}
                invalid={packagingHeight <= 0}
                onChange={({ target: { value } }) =>
                  dispatch(setAdvertDimensionHeight({ id: item.id, height: Number(value) }))
                }
              />
            </div>
            <div style={{ padding: 0 }}>
              <span>Largura (cm)</span> <span className="text-danger">*</span>
              <Input
                type="number"
                style={{ width: "100px" }}
                value={packagingWidth}
                valid={packagingWidth > 0}
                invalid={packagingWidth <= 0}
                onChange={({ target: { value } }) =>
                  dispatch(setAdvertDimensionWidth({ id: item.id, width: Number(value) }))
                }
              />
            </div>
            <div style={{ padding: 0 }}>
              <span>Comprimento (cm)</span> <span className="text-danger">*</span>
              <Input
                type="number"
                style={{ width: "100px" }}
                value={packagingLength}
                valid={packagingLength > 0}
                invalid={packagingLength <= 0}
                onChange={({ target: { value } }) =>
                  dispatch(setAdvertDimensionLength({ id: item.id, length: Number(value) }))
                }
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <strong>Peso (g)</strong> <span className="text-danger">*</span>
          </div>
          <Input
            type="number"
            style={{ width: "100px" }}
            value={packagingWeight}
            valid={packagingWeight > 0}
            invalid={packagingWeight <= 0}
            onChange={({ target: { value } }) =>
              dispatch(setAdvertWeight({ id: item.id, weight: Number(value) }))
            }
          />
        </div>
      </div>

      {loadingNewCategory ? (
        <div> Buscando atributos obrigatórios... </div>
      ) : (
        item.shopeeRequiredAttributes.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <div>
              <strong>Atributos obrigatórios</strong> <span className="text-danger">*</span>
            </div>

            {item.shopeeRequiredAttributes.map(attr => (
              <div style={{ marginTop: "10px" }}>
                <RequiredAttributeInput
                  key={attr.id}
                  attribute={attr}
                  onChangeText={handleChangeRequiredAttribute}
                  onChangeSelect={handleSelectRequiredAttributes}
                />
              </div>
            ))}
          </div>
        )
      )}

      {!hasPredictedCategory && (
        <div style={{ fontSize: "12px", marginTop: "5px", color: "#e74c3c", fontStyle: "italic" }}>
          <span className="text-danger">* Não foi possível sugerir uma categoria para esse anúncio.</span> Por
          favor, selecione uma categoria para prosseguir com a replicação
        </div>
      )}
    </>
  );
};

export default ExpandedRow;
