import React, { useContext }      from "react";
import { FaBars }                 from "react-icons/fa";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const CardTitle = () => {
  const { selectedCategory } = useContext(shopeeReplicateToMLContext);
  return (
    <>
      <h3>
        <FaBars className="mb-1" />&nbsp;
        Atributos obrigatórios
      </h3>
      <h6 className="text-muted">
        da categoria {selectedCategory?.category_name || ""}
      </h6>
    </>
  );
};
export default CardTitle;
