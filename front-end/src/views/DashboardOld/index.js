import React, { Suspense } from 'react';
const Main = React.lazy(() => import('../../components/Dashboard/Main'));

const Dashboard = () => {
  return (
    <Suspense fallback={<div>Carregando . . .</div>}>
      <Main />
    </Suspense>
  );
}

export default Dashboard;