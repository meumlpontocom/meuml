import {useCallback, useEffect, useState} from "react";
import Chart                              from "./Chart";
import {fetchDashboard}                   from "./requests";
import {useSelector, useDispatch}         from "react-redux";
import {CRow, CCol, CCard, CCardBody}     from "@coreui/react";
import SearchByDate                       from "./SearchByDate";
import LoadPageHandler                    from "../../components/Loading";
import InfoCard                           from "../../components/InfoCard";
import Swal                               from 'sweetalert2'
import { Redirect }                       from 'react-router-dom'
import "./styles.scss";

const Main = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const {
    percent_variance,
    summary,
    isLoading,
    fromDate,
    toDate,
  } = useSelector((state) => state.dashboard);

  const dispatch = useDispatch();

  function handleRedirectToHome() {
    setShouldRedirect(true);
  }

  const handleFetchDashboard = useCallback(async () => {
    const { success, error } = await fetchDashboard({dispatch, fromDate, toDate});
    if (!success && error) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${error.response ? error.response.data.message : error.message ? error.message : error}.</>`,
        type: "error",
        showCloseButton: true,
        onClose: handleRedirectToHome
      });
    }
  }, [fromDate, toDate, dispatch]);

  useEffect(() => {
    handleFetchDashboard();
  }, [handleFetchDashboard]);

  if (shouldRedirect) {
    return <Redirect to='/home'/>
  }

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <CCard>
            <CCardBody>
              <CRow>
                <CCol>
                  <SearchByDate/>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CRow>
            <CCol>
              <CCard>
                <CCardBody>
                  <CRow>
                    <CCol xs={12} sm={6} md={4} xl={3}>
                      <InfoCard
                        variation={null}
                        total={summary?.total_amount}
                        icon="cil-cash"
                        title="Total: R$"
                        prepend={true}
                      />
                    </CCol>
                    <CCol xs={12} sm={6} md={4} xl={3}>
                      <InfoCard
                        variation={percent_variance?.total_orders}
                        total={summary?.total_orders + summary?.new_orders}
                        icon="cil-history"
                        title={`Venda${summary?.total_orders + summary?.new_orders === 1 ? "" : "s"}`}
                      />
                    </CCol>
                    <CCol xs={12} sm={6} md={4} xl={3}>
                      <InfoCard
                        variation={null}
                        total={summary?.active_advertisings}
                        icon="cil-tags"
                        title={`Anúncio${summary?.active_advertisings === 1 ? "" : "s"} ativo${summary?.active_advertisings === 1 ? "" : "s"}`}
                      />
                    </CCol>
                    <CCol xs={12} sm={6} md={4} xl={3}>
                      <InfoCard
                        variation={percent_variance?.new_questions}
                        total={summary?.new_questions}
                        icon="cil-chat-bubble"
                        title={`Nova${summary?.new_questions === 1 ? "" : "s"} pergunta${summary?.new_questions === 1 ? "" : "s"}`}
                      />
                    </CCol>
                    <CCol xs={12} sm={6} md={4} xl={3}>
                      <InfoCard
                        variation={percent_variance?.total_visits}
                        total={summary?.total_visits}
                        icon="cil-mouse"
                        title={`Visita${summary?.total_visits === 1 ? "" : "s"} ao todo`}
                      />
                    </CCol>
                  </CRow>
                  <CCol>
                    <div className="chart-wrapper">
                      <Chart/>
                    </div>
                  </CCol>
                  <CRow></CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      }
    />
  );
};

export default Main;
