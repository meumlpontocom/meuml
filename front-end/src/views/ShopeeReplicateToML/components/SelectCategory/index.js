import React, { useState, useCallback, useContext } from "react";
import CategoriesTree                               from "./CategoriesTree";
import PredictedCategories                          from "./PredictedCategories";
import shopeeReplicateToMLContext                   from "../../shopeeReplicateToMLContext";

const SelectCategory = () => {
  const { categoryAttributes }                  = useContext(shopeeReplicateToMLContext);
  const [showCategoryTree, setShowCategoryTree] = useState(() => false);
  const handleShowAllCategoriesClick = useCallback(() => {
    setShowCategoryTree(previous => !previous);
  }, [setShowCategoryTree]);
  return categoryAttributes.id ? <></> : (
    <>
      {!showCategoryTree
        ? <PredictedCategories toggleCategoryTree={handleShowAllCategoriesClick} />
        : <CategoriesTree toggleCategoryTree={handleShowAllCategoriesClick} />
      }
    </>
  );
};

export default SelectCategory;
