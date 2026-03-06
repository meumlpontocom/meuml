import React            from "react";
import Page500          from "./Page500";
import ReactDOM         from "react-dom";
import { MemoryRouter } from "react-router";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render((
    <MemoryRouter>
      <Page500 />
    </MemoryRouter>
  ), div);
  ReactDOM.unmountComponentAtNode(div);
});
