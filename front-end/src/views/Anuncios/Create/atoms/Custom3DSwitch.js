import React                            from "react";
import PropTypes                        from "prop-types";
import { CSwitch, CLabel, CInputGroup } from "@coreui/react";

const Custom3DSwitch = ({ label, ...rest }) => {
  return (
    <CInputGroup>
      <CSwitch
        color="info"
        variant="3d"
        {...rest}
      />
      <CLabel htmlFor="collapseVariationsSwitch" className="ml-2 text-muted">
        {label}
      </CLabel>
    </CInputGroup>
  );
};

Custom3DSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  rest: PropTypes.object,
};

export default Custom3DSwitch;
