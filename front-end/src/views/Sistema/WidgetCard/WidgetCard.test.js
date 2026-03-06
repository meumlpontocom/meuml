import React      from 'react';
import ReactDOM   from 'react-dom';
import WidgetCard from './WidgetCard';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<WidgetCard />, div);
  ReactDOM.unmountComponentAtNode(div);
});
