import React       from "react";
import { shallow } from "enzyme"
import Credits     from "../index";

it("renders without crashing", () => {
  shallow(<Credits />);
});
