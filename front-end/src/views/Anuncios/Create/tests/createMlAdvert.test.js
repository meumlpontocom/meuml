import React from "react";
import ReactDOM from "react-dom";
import CreateMlAdvert from "src/views/Anuncios/Create/index";
import { shallow } from "enzyme";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<CreateMlAdvert />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  shallow(<CreateMlAdvert />);
});
