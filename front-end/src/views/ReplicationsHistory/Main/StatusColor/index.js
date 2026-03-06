import React from "react";
import "./style.css";

export default function StatusColor({ status }) {
  return (
    <>
      {status === 0 ? (
        <i className="cil-circle redBall mr-1" />
      ) : status === 1 ? (
        <i className="cil-circle greenBall mr-1" />
      ) : status === 2 ? (
        <i className="fa fa-circle yellowBall mr-1" />
      ) : status === 3 ? (
        <i className="fa fa-circle greyBall mr-1" />
      ) : (
        <></>
      )}
    </>
  );
}
