import React      from "react";
import PropTypes  from "prop-types";
import { CLabel } from "@coreui/react";

const Label = ({ htmlFor }) => {
  return (
    <CLabel htmlFor={htmlFor}>
      Qual a porcentagem de aumento no preço?
    </CLabel>
  );
}

Label.propTypes = {
  htmlFor: PropTypes.string.isRequired
}

export default Label
