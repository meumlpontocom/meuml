import React from 'react';
import ReactDOM from 'react-dom';
import MeusBloqueios from './MeusBloqueios';
import { shallow } from 'enzyme'


it('renders without crashing', () => {
  const div = document.createElement('div');
ReactDOM.render(<MeusBloqueios />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing', () => {
  shallow(<MeusBloqueios />);
});
