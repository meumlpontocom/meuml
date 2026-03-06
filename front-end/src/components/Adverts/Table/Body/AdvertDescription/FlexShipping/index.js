import React from "react";

export default function FlexShipping({ advertTags }) {
  const status =
    advertTags?.filter((tag) => tag === "self_service_in").length !== 0
      ? true
      : advertTags?.filter((tag) => tag === "self_service_out").length !== 0
      ? false
      : null;
  return status === true ? (
    <span className="text-success">
      <i className="cil-truck mr-1 ml-2" />
      Flex Ativado
    </span>
  ) : status === false ? (
    <span className="text-danger">
      <i className="cil-truck mr-1 ml-2" />
      Flex Desativado
    </span>
  ) : (
    <></>
  );
}
