import React     from "react";
import PropTypes from "prop-types";

const AdvertImage = ({ src }) => (
  <td style={{ verticalAlign: "middle" }} className="table-advert-thumb">
    <img
      className="table-image"
      id="table-img"
      alt="img"
      src={src}
      width={75}
      loading="lazy"
    />
  </td>
);

AdvertImage.propTypes = {
  src: PropTypes.string,
};
export default AdvertImage;
