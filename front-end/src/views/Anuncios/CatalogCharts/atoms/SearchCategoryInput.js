import React, { useContext }    from "react";
import { Input }                from "reactstrap";
import { FaSearch }             from "react-icons/fa";
import { catalogChartsContext } from "../catalogChartsContext";

export default function SearchCategoryInput() {
  const { searchKeyword, setSearch, fetchCategories, disableSearch, refs: { searchCategoryInputRef } } = useContext(catalogChartsContext);

  function onValueChange(event) {
    const {
      target: { value },
    } = event;
    setSearch(value);
  }

  async function handleKeyPress({ key }) {
    if (key === "Enter" && searchKeyword) {
      fetchCategories();
    }
  }

  return (
    <Input
      innerRef={searchCategoryInputRef}
      bsSize="lg"
      prepend={<FaSearch />}
      id="category-search"
      name="category-search"
      value={searchKeyword}
      onChange={onValueChange}
      disabled={disableSearch}
      onKeyPress={handleKeyPress}
      placeholder="Pesquise a categoria do anúncio"
    />
  );
}
