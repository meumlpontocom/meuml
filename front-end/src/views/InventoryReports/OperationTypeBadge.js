import React      from "react";
import PropTypes  from "prop-types";
import { CBadge } from "@coreui/react";

function OperationTypeBadge({ type }) {
  const OutBadge = () => <CBadge color="primary">Saída</CBadge>;
  const InBadge = () => <CBadge color="success">Entrada</CBadge>;
  return type === "OUT" ? <OutBadge /> : <InBadge />;
}

OperationTypeBadge.propTypes = {
  type: PropTypes.string.isRequired
}

export default OperationTypeBadge

