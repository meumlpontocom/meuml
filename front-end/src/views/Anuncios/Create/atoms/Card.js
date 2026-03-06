import React     from "react";
import PropTypes from "prop-types";
import { CCard } from "@coreui/react";

const Card = ({ children, isVisible, className, ...rest }) => {
  return isVisible
    ? (
      <CCard className={className} {...rest}>
        {children}
      </CCard>
    ) : <></>;
};

Card.propTypes = {
  rest: PropTypes.any,
  children: PropTypes.any,
  isVisible: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
