import React from "react";
import { useSelector } from "react-redux";

export default function AccountFlexShipping({ id }) {
  const internal_tags = useSelector(
    ({ accounts }) => accounts.accounts[id]?.internal_tags
  );
  const platform = useSelector(
    ({ accounts }) => accounts.accounts[id]?.platform
  );

  if (platform === "ML")
    return (
      <div className="details-container  d-flex justify-content-center align-items-center p-0 flex-start">
        <div
          className="icon-container d-flex justify-content-center align-items-center rounded-bottom-left"
          title="envio"
        >
          <i className="cil-truck icon" />
        </div>
        <div className="flex-grow-1 ml-1">
          <p className="m-0 pl-1">
            <span className="font-weight-bold text-muted d-block">
              Envio Flex:
            </span>
            {internal_tags
              ? internal_tags.filter((tag) => tag === "meuml_tag_flex")
                  .length !== 0
                ? "Ativado"
                : "Desativado"
              : "Desativado"}
          </p>
        </div>
      </div>
    );
  return <></>;
}
