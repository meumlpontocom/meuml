import React     from "react";
import PropTypes from "prop-types";

const Th = ({ id, children, ...rest }) => (
  <th id={id} key={id} {...rest}>
    {children}
  </th>
);

Th.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.elementType,
};

export default Th;
