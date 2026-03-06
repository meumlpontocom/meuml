import "./index.css";
import React, { useCallback, useContext } from "react";
import BlackCard                          from "../BlackCard";
import { CCol }                           from "@coreui/react";
import CategoriesList                     from "../CategoriesList";
import SelectedCategoryPath               from "../SelectedCategory/SelectedCategoryPath";
import shopeeReplicateToMLContext         from "../../shopeeReplicateToMLContext";
import Button                             from "../../../../components/buttons/Button";
import LoadingCardData                    from "../../../../components/LoadingCardData";

const CategoriesTree = ({ toggleCategoryTree }) => {
  const {
    categoryAttributes,
    isLoadingCategoryAttributes,
    selectedCategory,
    setSelectedCategory,
    resetStates,
  } = useContext(shopeeReplicateToMLContext);

  const handleToggleBtnClick = useCallback(() => {
    resetStates();
    toggleCategoryTree();
  }, [resetStates, toggleCategoryTree]);

  return (
    <CCol xs="12" md="10" lg="8" xl="6">
      <BlackCard
        header={
          <>
            <h3>Árvore de categorias</h3>
            <SelectedCategoryPath path={categoryAttributes?.path} />
          </>
        }
        body={
          isLoadingCategoryAttributes ? (
            <div
              className="d-flex justify-content-center"
              style={{ width: "100%" }}
            >
              <LoadingCardData />
            </div>
          ) : (
            <CategoriesList
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          )}
        footer={
          <Button
            color="outline-primary"
            size="lg"
            block
            onClick={handleToggleBtnClick}
          >
            Voltar
          </Button>
        }
      />
    </CCol>
  );
};

export default CategoriesTree;
