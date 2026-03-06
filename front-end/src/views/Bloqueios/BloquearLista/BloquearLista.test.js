import React from 'react';
import ReactDOM from 'react-dom';
import BloquearEmMassa from './BloquearLista';
import { shallow } from 'enzyme'


it('renders without crashing', () => {
  const div = document.createElement('div');
ReactDOM.render(<BloquearLista />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing', () => {
  shallow(<BloquearLista />);
});
