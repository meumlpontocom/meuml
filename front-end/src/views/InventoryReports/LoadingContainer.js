import React           from "react";
import PropTypes       from "prop-types";
import LoadingCardData from "src/components/LoadingCardData";

function LoadingContainer({ isLoading, children }) {
  return isLoading
  ? <LoadingCardData />
  : children;
}

LoadingContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired
}

export default LoadingContainer;
