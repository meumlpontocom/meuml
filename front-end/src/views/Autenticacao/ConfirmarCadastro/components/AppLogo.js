import React from "react";
import logo  from "src/assets/img/brand/sygnet-logo.png";

const AppLogo = () => {
  return (
    <div id="div-logo">
      <h2>
        <img id="logo" name="logo" src={logo} width="20%" alt="MeuML" />
      </h2>
    </div>
  );
};

export default AppLogo;
