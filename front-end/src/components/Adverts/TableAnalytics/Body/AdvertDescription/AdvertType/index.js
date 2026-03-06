import React from "react";
import getListingTypes from "../../../../../../helpers/getListingTypes";

export default function AdvertType({ status, listing }) {
  const adStyle = {
    color:
      listing === "free"
        ? "red"
        : listing === "gold_special"
        ? "#eb801d"
        : "green"
  };
  return status ? (
    <>
      <span style={adStyle}>
        <i className="cil-audio-description mr-1" />
        Anúncio {getListingTypes(listing)}
      </span>{" "}
    </>
  ) : null;
}
