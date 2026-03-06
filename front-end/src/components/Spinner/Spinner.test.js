import React    from "react";
import ReactDOM from "react-dom";
import Spinner  from "./Spinner";

const TestSpinner = () => (
  <Spinner top={100} height={100} width={100} color="#fff" />
);

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<TestSpinner />, div);
  ReactDOM.unmountComponentAtNode(div);
});
