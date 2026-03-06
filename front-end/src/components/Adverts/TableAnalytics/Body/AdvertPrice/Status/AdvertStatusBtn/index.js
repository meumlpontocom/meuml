import React, { useState, useEffect, useContext } from "react";
import { DropDown } from "../../../../../../buttons/ButtonGroup";
import priceContext from "../../priceContext";
import Action from "./Action";

export default function AdvertStatusBtn() {
  const [className, setClassName] = useState("primary");
  const [statusText, setStatusText] = useState("");
  const { status } = useContext(priceContext);
  useEffect(() => {
    function handleAdvertStatusText() {
      switch (status) {
        case "active":
          setClassName("success");
          setStatusText("Ativo");
          break;
        case "paused":
          setClassName("warning");
          setStatusText("Pausado");
          break;
        case "closed":
          setClassName("danger");
          setStatusText("Finalizado");
          break;
        default:
          setClassName("secondary");
          setStatusText("Em Revisão");
          break;
      }
    }
    handleAdvertStatusText();
  }, []);
  return (
    <>
      <DropDown
        btnGroupClassName={`btn btn-sm btn-ghost-${className}`}
        style={{ zIndex: "inherit" }}
        direction="down"
        caret={true}
        color="*"
        title={
          <span style={{ marginLeft: "-0.5em" }}>
            <i className="cil-power-standby mr-1" />
            {statusText}
          </span>
        }
      >
        <Action action={0} />
        <Action action={1} />
        <Action action={2} />
        <Action action={3} />
      </DropDown>
      <br />
    </>
  );
}
