import React        from "react";
import ReactDOM     from "react-dom";
import Processos    from "./index";
import TestProvider from "src/redux/store/tests";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render((
    <TestProvider>
      <Processos />
    </TestProvider>
  ), div);
  ReactDOM.unmountComponentAtNode(div);
});
