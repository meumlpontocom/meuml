import PropTypes from "prop-types";

const variationsPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    attributes: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ),
  })
);
export default variationsPropTypes;
