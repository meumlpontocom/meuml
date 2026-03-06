import React, { useCallback, useContext, useMemo } from "react";
import PropTypes                                   from "prop-types";
import BlackCard                                   from "../BlackCard";
import { CCol, CLabel, CSelect }                   from "@coreui/react";
import ClearSelectionBtn                           from "./ClearSelectionBtn";
import ShowCategoryTreeBtn                         from "./ShowCategoryTreeBtn";
import shopeeReplicateToMLContext                  from "../../shopeeReplicateToMLContext";

const PredictedCategories = ({ toggleCategoryTree }) => {
  const {
    mlPredictedCategories,
    setSelectedCategory,
    selectedCategory,
  } = useContext(shopeeReplicateToMLContext);
  const noPredictedSelected = useMemo(() => {
    return !selectedCategory.category_id
  }, [selectedCategory]);
  const handleSelectOption = useCallback(({ target }) => {
    setSelectedCategory(JSON.parse(target.value));
  }, [setSelectedCategory]);
  return (
    <CCol xs="12" md="10" lg="8" xl="6">
      <BlackCard
        header={<h3>Categoria do anúncio</h3>}
        body={
          <>
            <CCol>
              <CLabel>
                <p>Selecione uma categoria sugerida</p>
              </CLabel>
              <CSelect
                style={{ backgroundColor: "#ced2d8" }}
                value={JSON.stringify(selectedCategory)}
                onChange={handleSelectOption}
              >
                <option value="{}">Selecione...</option>
                {mlPredictedCategories.map(category => (
                  <option
                    value={JSON.stringify(category)}
                    id={category.category_id}
                    name={category.category_name}
                    key={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </CSelect>
            </CCol>
            <CCol className="mt-4">
              {
                noPredictedSelected
                ? <ShowCategoryTreeBtn toggleCategoryTree={toggleCategoryTree} />
                : <ClearSelectionBtn />
              }
            </CCol>
          </>
        }
      />
    </CCol>
  );
};

PredictedCategories.propTypes = {
  toggleCategoryTree: PropTypes.func.isRequired,
};

export default PredictedCategories;
