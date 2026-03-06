import CIcon from "@coreui/icons-react";
import React from "react";

const Topic = ({ topic, handleChange }) => {
  return (
    <div className="form-check ">
      <input
        className="form-check-input"
        type="checkbox"
        name={topic.name}
        value={topic.key}
        id={topic.key}
        onChange={handleChange}
      />
      <label className="form-check-label" htmlFor={topic.key}>
        <CIcon name="cilCheckCircle" size="lg" className="mr-3" />
        {topic.name}
      </label>
    </div>
  );
};

export default Topic;
