import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./style.css";
import { FaChevronRight } from "react-icons/fa";
import { CSpinner } from "@coreui/react";
import { setMlCategoriesPath } from "src/redux/actions/_mlCategoriesActions";
import api from "src/services/api";
import context from "../../advertReplicationContext";
import { SELECT_ML_CATEGORY_HEIGHT } from "src/constants";

const CategoryList = ({ onClose, selectBottomPosition }) => {
  const dispatch = useDispatch();
  const { setCategory } = useContext(context);
  const { categoriesIndex } = useSelector(state => state.mlCategories);
  const [categories, setCategories] = useState(categoriesIndex);

  const containerRef = useRef(null);
  const [loadingHeight, setLoadingHeight] = useState(SELECT_ML_CATEGORY_HEIGHT);
  const [loadingWidth, setLoadingWidth] = useState(SELECT_ML_CATEGORY_HEIGHT);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const handleNavigateTree = async category => {
    try {
      setIsLoadingTree(true);
      const { data } = await api.post(`/categories-tree?category_id=${category.id}`);
      dispatch(setMlCategoriesPath(data.data.path));
      if (data.data.children.length) {
        setCategory({
          path: data.data.path.map(item => item.name).join(" > "),
        });
        setCategories(data.data.children);
      } else {
        setCategory({
          id: category.id,
          name: category.name,
          path: data.data.path.map(item => item.name).join(" > "),
        });
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTree(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let containerHeight = rect.height;
      let containerWidth = rect.width;
      if (containerHeight > SELECT_ML_CATEGORY_HEIGHT) containerHeight = SELECT_ML_CATEGORY_HEIGHT;
      setLoadingHeight(containerHeight);
      setLoadingWidth(containerWidth);
    }
  }, [categories]);

  return (
    <div id="container" ref={containerRef}>
      {categories?.map(category => (
        <button id="option-select" key={category.id} onClick={() => handleNavigateTree(category)}>
          {category.name}
          <FaChevronRight className="mr-4" color="#aaa" size={14} />
        </button>
      ))}
      {isLoadingTree ? (
        <div
          className="spinner-container"
          style={{ height: loadingHeight, top: selectBottomPosition, width: loadingWidth }}
        >
          <CSpinner color="secondary" />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default CategoryList;
