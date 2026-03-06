import React           from "react"
import PropTypes       from "prop-types"
import { CCardHeader } from "@coreui/react";

const Section = ({ children }) => (
  <CCardHeader>
    <h4 className="text-dark">{children}</h4>
  </CCardHeader>
);

Section.propTypes = {
  children: PropTypes.string.isRequired
}

export default Section;
