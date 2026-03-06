import React     from "react";
import PropTypes from "prop-types";

const NoVariationRegistered = ({ isCreatingVariation, hasCreatedVariation }) => {
  return !isCreatingVariation && !hasCreatedVariation ? (
    <p className="text-center text-muted">
      Nenhuma variação cadastrada
    </p>
  ) : <></>;
};

NoVariationRegistered.propTypes = {
  isCreatingVariation: PropTypes.bool.isRequired,
  hasCreatedVariation: PropTypes.bool.isRequired,
};

export default NoVariationRegistered;
