import React from "react";
import { CIcon } from "@coreui/icons-react";

const SinglePlan = ({ handleChange, planName, planId, planSelected }) => {
  return (
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="planOptions"
        id={planId}
        value={planName}
        onChange={handleChange}
        checked={planSelected}
      />
      <label className="form-check-label" htmlFor={planId}>
        <CIcon name="cilCheckCircle" size="lg" className="mr-3" />
        {planName}
      </label>
    </div>
  );
};

export default SinglePlan;
