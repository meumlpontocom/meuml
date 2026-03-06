import React     from "react";
import PropTypes from "prop-types";

const Td = ({ id, children }) => (
  <td id={id} key={id}>
    {children}
  </td>
);

Td.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.elementType,
};

export default Td;
