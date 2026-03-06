import React              from "react";
import { Container }      from "./styles";
import PropTypes          from "prop-types";

export default function MassChanges({ children, title, style }) {
  return (
    <Container className="container">
      <div className="col-12">
        <div className="header-title" style={style}>
          {title}
        </div>
      </div>
      <div className="col-12">
        <hr />
      </div>
      {children}
    </Container>
  );
}

MassChanges.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array])
    .isRequired,
  title: PropTypes.string.isRequired
};
