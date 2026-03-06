import React     from "react";
import PropTypes from "prop-types";

const PrettyRenderJSON = ({ json }) => {
  return (
      <div className="bg-secondary">
          <pre className="text-danger">{JSON.stringify(json, undefined, 4)}</pre>
      </div>
  );
};

PrettyRenderJSON.propTypes = {
  json: PropTypes.object.isRequired,
};

export default PrettyRenderJSON;
