import React from 'react';

const SoldQuantity = ({ render, amount }) => {
  return render ? (
    <p>Vendido: {amount}</p>
  ) : null
}

export default SoldQuantity;
