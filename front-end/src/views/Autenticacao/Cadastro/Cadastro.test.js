import React from 'react';
import ReactDOM from 'react-dom';
import Cadastro from './Cadastro';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Cadastro />, div);
  ReactDOM.unmountComponentAtNode(div);
});
