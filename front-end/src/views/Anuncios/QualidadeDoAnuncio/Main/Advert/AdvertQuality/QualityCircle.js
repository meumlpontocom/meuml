import React, { useContext } from "react";
import Circle from "react-circle";
import Button from "reactstrap/lib/Button";
import context from "./context";
import "./circleBtnStyle.css";

export default function QualityCircle() {
  const { id, color, quality, isPopoverOpen, setPopoverOpen } = useContext(
    context
  );

  function handleClick() {
    if (!isPopoverOpen) {
      document.querySelector(`#quality-circle-btn-${id}`).click();
      setPopoverOpen();
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="quality-circle-btn"
      id={`quality-circle-btn-${id}`}
    >
      <Circle
        progressColor={color}
        responsive={false}
        progress={quality === "Não Disponível" ? "- " : quality}
        size={76}
      />
    </Button>
  );
}
