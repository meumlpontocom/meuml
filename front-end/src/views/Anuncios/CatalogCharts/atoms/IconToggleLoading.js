import React        from "react";
import PropTypes    from "prop-types";
import { CSpinner } from "@coreui/react";

const IconToggleLoading = ({ isLoading, Icon }) => {
  return isLoading ? <CSpinner color="primary" size="sm" /> : Icon;
};

IconToggleLoading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  Icon: PropTypes.object.isRequired,
};

export default IconToggleLoading;
