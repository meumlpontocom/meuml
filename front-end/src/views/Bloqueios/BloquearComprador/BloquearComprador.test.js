import React from 'react';
import ReactDOM from 'react-dom';
import BloquearComprador from './BloquearComprador';
import { shallow } from 'enzyme'


it('renders without crashing', () => {
  const div = document.createElement('div');
ReactDOM.render(<BloquearComprador />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing', () => {
  shallow(<BloquearComprador />);
});
