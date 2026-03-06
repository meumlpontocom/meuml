import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme'
import Dashboard from './index';

it('renders without crashing', () => {
  const div = document.createElement('div');
ReactDOM.render(<Dashboard />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing', () => {
  shallow(<Dashboard />);
});
