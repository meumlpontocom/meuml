import React from 'react';
import { Link } from 'react-router-dom';

const ViewsHistory = ({ id }) => {
  return (
    <Link
      className='dropdown-item'
      to={{
        from: '/posicionamento',
        pathname: `/historico-de-visitas/${id}`,
        state: { advertID: id },
      }}
    >
      <i className='cil-library mr-1' />
      Ver Visitas
    </Link>
  );
};

export default ViewsHistory;
