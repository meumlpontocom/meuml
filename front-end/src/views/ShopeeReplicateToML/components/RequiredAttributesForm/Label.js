import React        from "react";
import PropTypes    from "prop-types";

const Label = ({ id, name }) => {
  const Content = () =>
    <label htmlFor={id} id={id} className="text-info">
      <strong>{name}</strong>
    </label>;
  return <Content />;
};

Label.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default Label;
