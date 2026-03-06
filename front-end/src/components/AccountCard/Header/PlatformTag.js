import React from "react";
import { useSelector } from "react-redux";

const PlatformTag = ({ id }) => {
  const platform = useSelector(
    ({ accounts }) => accounts.accounts[id]?.platform
  );
  const bgStyle =
    platform === "ML"
      ? { backgroundColor: "#FFE600" }
      : { backgroundColor: "#EE4D2D", color: "#fff" };

  return (
    <div
      className="my-0 px-2 plataform rounded d-flex align-items-center"
      style={bgStyle}
    >
      <p className="my-0 py-0">{platform}</p>
    </div>
  );
};

export default PlatformTag;
