import React from "react";
import PropTypes from "prop-types";

function Thumbnail({ secure_thumbnail }) {
  return (
    <td style={{ width: "80px" }}>
      <img
        id="advert-img"
        name="advert-img"
        width="80"
        src={secure_thumbnail}
        alt="img"
      />
    </td>
  );
}

Thumbnail.propTypes = {
  secure_thumbnail: PropTypes.string,
};

export default Thumbnail;
