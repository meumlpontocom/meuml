import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import ConfirmarCadastro from ".";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MemoryRouter>
      <ConfirmarCadastro />
    </MemoryRouter>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
