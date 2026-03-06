import React             from "react"
import PropTypes         from "prop-types"
import { FaCheckCircle } from "react-icons/fa";

const ActiveStatusText = () => (
  <span className="active">
    <FaCheckCircle />&nbsp;ATIVO:
  </span>
);

const EligibleStatusText = () => (
  <span className="eligible-text">elegível:</span>
);

const Status = ({ active }) => (
  active
    ? <ActiveStatusText />
    : <EligibleStatusText />
);

Status.propTypes = {
  active: PropTypes.bool.isRequired,
}

export default Status;
