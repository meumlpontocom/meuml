import React        from "react";
import { shallow }  from "enzyme"
import ReactDOM     from "react-dom";
import ListaContas  from "./ListaContas";
import TestProvider from "src/redux/store/tests";


it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render((
    <TestProvider>
      <ListaContas />
    </TestProvider>
  ), div);
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  shallow(
    <TestProvider>
      <ListaContas />
    </TestProvider>
  );
});
