import React                 from "react";
import PropTypes             from "prop-types";
import scrollViewToElementId from "src/helpers/scrollViewToElementId";

const UpperCaseStrongSpan = ({ children, navigateOnClick }) => {
  const handleClick = () => scrollViewToElementId(navigateOnClick);
  return (
    <span className="text-info pointer" onClick={() => handleClick()}>
      <strong>{children.toUpperCase()}</strong>
    </span>
  );
};

UpperCaseStrongSpan.propTypes = {
  children: PropTypes.string.isRequired,
};

export default UpperCaseStrongSpan;
