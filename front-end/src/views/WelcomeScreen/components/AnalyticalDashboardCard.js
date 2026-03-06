import CIcon from "@coreui/icons-react";
import { CCard, CCardBody, CCardFooter } from "@coreui/react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "src/views/Dashboard/requests";
import Loading from 'react-loading';

export const AnalyticalDashboardCard = () => {
  const {
    fromDate,
    toDate,
    isLoading
  } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const [isDashboardEnabled, setIsDashboardEnabled] = useState(false);

  const handleFetchDashboard = useCallback(async () => {
    const { success } = await fetchDashboard({dispatch, fromDate, toDate});
    setIsDashboardEnabled(success);
  }, [fromDate, toDate, dispatch]);
  
  useEffect(() => {
    handleFetchDashboard()
  }, [handleFetchDashboard]);

  return (
    <CCard className="text-center">
      <CCardBody className="p-2">
        <div className="text-value-lg d-flex align-items-center justify-content-center">
          <CIcon size={"2xl"} name={"cilChartLine"} className="mx-3" />
          Dashboard Analítico
        </div>
      </CCardBody>
      <CCardFooter className="d-flex align-items-center justify-content-center p-2">
        {
          isLoading ?
            <Loading type="bars" color="#054785" height={22} width={22} /> 
          :
          !isDashboardEnabled ? 
            <div>
              Apenas para assinantes do MeuML v2. Faça já sua assinatura e obtenha acesso
            </div>
          :
            <>
              <Link to="/dashboard">Acesse aqui</Link>
              <i className="cil-arrow-right text-primary ml-2" />
            </>
        }
      </CCardFooter>
    </CCard>
  );
};
