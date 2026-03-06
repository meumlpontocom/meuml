import React     from "react";
import PropTypes from "prop-types";

const ToggleShowSelectOptions = ({ show, options }) => {
  return show && options?.length ? (
    options.map(({ id, names: { MLB } }) => (
      <option value={id} id={id} key={id}>
        {MLB}
      </option>
    ))
  ) : (
    <></>
  );
};

ToggleShowSelectOptions.propTypes = {
  show: PropTypes.bool.isRequired,
  options: PropTypes.array.isRequired,
};

export default ToggleShowSelectOptions;
