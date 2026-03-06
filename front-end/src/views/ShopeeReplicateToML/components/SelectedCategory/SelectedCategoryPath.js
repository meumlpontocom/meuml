import React     from "react";
import PropTypes from "prop-types";
import { CCol }  from "@coreui/react";

const SelectedCategoryPath = ({ path }) =>
  path ? (
    <CCol>
      <h5 className="mb-3 mt-4">
        <strong className="text-info ">Árvore da categoria selecionada:<br /></strong>
        {path.map(({ name }) => name).join("/")}
      </h5>
    </CCol>
  ) : <></>;

SelectedCategoryPath.propTypes = {
  path: PropTypes.array.isRequired,
};

export default SelectedCategoryPath;
