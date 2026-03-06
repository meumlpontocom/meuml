import React from 'react';
import { Button } from 'reactstrap';

const Btn = ({ children, color, className, onClick }) => (
  <Button color={color} size="sm" className={ className } onClick={() => onClick()}>
    { children }
  </Button>
);

export default Btn;
