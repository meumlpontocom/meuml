import React       from "react";
import PropTypes   from "prop-types";
import { CButton } from "@coreui/react";
import { FaShip }  from "react-icons/fa";

const ShowCategoryTreeBtn = ({ toggleCategoryTree }) => {
  return (
    <CButton
      color="primary"
      variant="outline"
      block
      size="lg"
      onClick={toggleCategoryTree}
    >
      <FaShip className="mb-1" />&nbsp;
      Navegar por categorias
    </CButton>
  );
};

ShowCategoryTreeBtn.propTypes = {
  toggleCategoryTree: PropTypes.func.isRequired
}

export default ShowCategoryTreeBtn;
