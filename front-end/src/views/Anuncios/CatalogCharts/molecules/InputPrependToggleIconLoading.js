import React             from "react";
import PropTypes         from "prop-types";
import InputGroupPrepend from "../atoms/InputGroupPrepend";
import IconToggleLoading from "../atoms/IconToggleLoading";

const InputPrependToggleIconLoading = ({ isLoading, Icon }) => {
  return (
    <InputGroupPrepend>
      <IconToggleLoading Icon={Icon} isLoading={isLoading} />
    </InputGroupPrepend>
  );
};

InputPrependToggleIconLoading.propTypes = {
  Icon: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default InputPrependToggleIconLoading;
