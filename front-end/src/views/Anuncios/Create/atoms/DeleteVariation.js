import React, { useContext }     from "react";
import PropTypes                 from "prop-types";
import { createMlAdvertContext } from "../createMlAdvertContext";

const DeleteVariation = ({ id }) => {
  const { form, setFormData } = useContext(createMlAdvertContext);
  const handleDeleteVariationClick = () => {
    setFormData({
      id: "variations",
      value: form.variations.filter(variation => variation._id !== id),
    });
  };
  return (
    <button type="button" className="close" aria-label="Apagar" onClick={handleDeleteVariationClick}>
      <span aria-hidden="true">&times;</span>
    </button>
  );
};

DeleteVariation.propTypes = {
  id: PropTypes.string.isRequired,
};

export default DeleteVariation;
