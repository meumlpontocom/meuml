/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useMemo } from "react";
import { CListGroup, CListGroupItem } from "@coreui/react";
import classNames from "classnames";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";

const CategoriesList = () => {
  const { categoriesTree, selectedCategory, setSelectedCategory, categoriesTreeNavigated } =
    useContext(shopeeReplicateToMLContext);
  const classnames = isSelected =>
    classNames("pointer category-tree-item", isSelected && "category-tree-item-active");
  const handleCategoryClick = useCallback(({ target }) => {
    setSelectedCategory({ id: target.id });
  }, []);
  const categories = useMemo(() => {
    return categoriesTreeNavigated.length ? categoriesTreeNavigated : categoriesTree;
  }, [categoriesTreeNavigated, categoriesTree]);
  return (
    <CListGroup className="category-tree">
      {categories.map(category => (
        <CListGroupItem
          key={category.id}
          id={category.id}
          name={category.name}
          onClick={event => handleCategoryClick(event)}
          className={classnames(selectedCategory === category.id)}
        >
          {category.name}
        </CListGroupItem>
      ))}
    </CListGroup>
  );
};

export default CategoriesList;
