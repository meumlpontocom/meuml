import React       from "react";
import ReactDOM    from "react-dom";
import Inicio      from "./index";
import { shallow } from "enzyme";


it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Inicio />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  shallow(<Inicio />);
});
