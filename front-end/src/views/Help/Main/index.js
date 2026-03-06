import React, { useEffect } from "react";

const Main = () => {
  const fluid = document.querySelector(".container-fluid");
  const main = document.querySelector(".main");
  const breadcrumb = document.querySelector(".breadcrumb");

  useEffect(() => {
    fluid.style.height = `${main.clientHeight - 100}px`;
    fluid.style.paddingRight = 0;
    fluid.style.paddingLeft = 0;
    fluid.style.paddingBottom = 0;
    breadcrumb.style.marginBottom = 0;
    return function () {
      fluid.style.removeProperty("height");
      fluid.style.removeProperty("padding-right");
      fluid.style.removeProperty("padding-left");
      fluid.style.removeProperty("padding-bottom");
      breadcrumb.style.removeProperty("margin-bottom");
    };
  }, [
    breadcrumb.style,
    breadcrumb.style.marginBottom,
    fluid.style,
    fluid.style.height,
    fluid.style.offsetTop,
    fluid.style.offsetWidth,
    fluid.style.padding,
    fluid.style.paddingBottom,
    fluid.style.paddingLeft,
    fluid.style.paddingRight,
    main.clientHeight,
  ]);
  return (
    <iframe
      src="https://meuml.com/help"
      frameBorder="0"
      marginHeight="0"
      marginWidth="0"
      title="Perguntas Frequentes"
      id="help2"
      className="w-100"
      style={{ height: "100%", overflow: "hidden" }}
    />
  );
};

export default Main;
