import React from "react";
import PropTypes from "prop-types";
import LoadingCardData from "src/components/LoadingCardData";

const LoadingContainer = (props) =>
  props.isLoading ? <LoadingCardData /> : props.children;

LoadingContainer.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.elementType,
};

export default LoadingContainer;
