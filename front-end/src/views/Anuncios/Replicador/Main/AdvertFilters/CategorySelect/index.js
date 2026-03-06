import React, { useContext, useEffect, useRef, useState } from "react";
import CategoryList from "./CategoryList";
import CustomSelect from "src/components/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "reactstrap";
import context from "../../advertReplicationContext";
import Skeleton from "src/components/SkeletonLoading";
import { saveMlCategories, setMlCategoriesLoading } from "src/redux/actions/_mlCategoriesActions";
import api from "src/services/api";
import { getToken } from "src/services/auth";

const CategorySelect = () => {
  const dispatch = useDispatch();
  const { isLoading: isLoadingCategory } = useSelector(state => state.mlCategories);
  const { category } = useSelector(state => state.advertsReplication.queryParams);
  const { isLoading } = useContext(context);

  const containerRef = useRef(null);
  const [bottomPosition, setBottomPosition] = useState(0);

  const CategorySkeleton = () => {
    return <Skeleton.Line height={42} />;
  };

  const handleGetCategories = async () => {
    try {
      dispatch(setMlCategoriesLoading(true));
      const { data } = await api.get("/categories-tree", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (data.statusCode === 200) dispatch(saveMlCategories(data.data));
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setMlCategoriesLoading(false));
    }
  };

  useEffect(() => {
    handleGetCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const containerBottom = rect.bottom;
      setBottomPosition(containerBottom);
    }
  }, []);

  return (
    <>
      <Label>Categoria</Label>
      {!isLoadingCategory ? (
        <CustomSelect
          placeholder="Filtrar por categoria..."
          value={category?.path}
          disabled={isLoading}
          ref={containerRef}
        >
          <CategoryList selectBottomPosition={bottomPosition} />
        </CustomSelect>
      ) : (
        <CategorySkeleton />
      )}
    </>
  );
};

export default CategorySelect;
