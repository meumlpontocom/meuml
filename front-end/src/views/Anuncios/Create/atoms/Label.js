import React                from "react";
import PropTypes            from "prop-types";
import { CPopover, CLabel } from "@coreui/react";

const Label = ({ hint, children, htmlFor }) => {
  return (
    <CPopover content={hint} placement="bottom">
      <CLabel htmlFor={htmlFor}>
        {children}
      </CLabel>
    </CPopover>
  );
};

Label.propTypes = {
  hint: PropTypes.string,
  children: PropTypes.any.isRequired,
};

export default Label;
