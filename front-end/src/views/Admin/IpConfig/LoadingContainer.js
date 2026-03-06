import React           from "react";
import PropTypes       from "prop-types";
import LoadingCardData from "src/components/LoadingCardData";

const LoadingContainer = ({ isLoading, children }) => {
  return isLoading ? <LoadingCardData /> : children;
};

LoadingContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.any.isRequired,
};

export default LoadingContainer;
