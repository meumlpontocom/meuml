import React, { useContext } from "react";
import AdvertStatusBtn from "./AdvertStatusBtn";
import priceContext from "../priceContext";

const Status = () => {
  const { render } = useContext(priceContext);
  return render ? (
    <AdvertStatusBtn />
  ) : <></>;
};

export default Status;
