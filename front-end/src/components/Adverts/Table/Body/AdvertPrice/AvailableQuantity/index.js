import React from 'react';

const AvailableQuantity = ({ render, amount }) => (
  render ? <p>Disponível: {amount}</p> : null
);

export default AvailableQuantity;
