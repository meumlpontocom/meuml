import React from 'react';
import ReactDOM from 'react-dom';
import BloquearEmMassa from './MinhasListasDeBloqueio';
import { shallow } from 'enzyme'


it('renders without crashing', () => {
  const div = document.createElement('div');
ReactDOM.render(<MinhasListasDeBloqueio />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing', () => {
  shallow(<MinhasListasDeBloqueio />);
});
