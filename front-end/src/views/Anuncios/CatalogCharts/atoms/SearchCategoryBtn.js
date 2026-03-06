import React, { useContext } from "react";
import classNames from "classnames";
import { catalogChartsContext } from "../catalogChartsContext";
import ButtonComponent from "src/components/ButtonComponent";

export default function SearchCategoryBtn() {
  const { fetchCategories, isLoadingCategories, disableSearch } = useContext(catalogChartsContext);
  const buttonClassNames = classNames(isLoadingCategories && "loading-search-category-btn disabled");

  async function handleClick() {
    fetchCategories();
  }

  return (
    // <CButton
    //   color="dark"
    //   size="lg"
    //   disabled={disableSearch || isLoadingCategories}
    //   className={buttonClassNames}
    //   onClick={handleClick}
    //   block
    // >
    //   {isLoadingCategories ? <Spinner width={30} height={30} color="#fff" /> : <FaSearch />}&nbsp;Pesquisar
    // </CButton>

    <ButtonComponent
      color="dark"
      disabled={disableSearch || isLoadingCategories}
      title="Pesquisar"
      icon="cil-search"
      isLoading={isLoadingCategories}
      className={buttonClassNames}
      onClick={handleClick}
      variant=""
      width="100%"
    />
  );
}
