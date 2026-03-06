import React            from "react";
import { shallow }      from "enzyme";
import ReactDOM         from "react-dom";
import CallBack         from "./CallBack";
import { MemoryRouter } from "react-router";


it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render((
    <MemoryRouter>
      <CallBack />
    </MemoryRouter>
  ), div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  shallow(<CallBack />);
});
