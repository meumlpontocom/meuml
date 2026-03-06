import { CCol, CRow } from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useMemo, useState } from "react";
import api from "src/services/api";
import Skeleton from "src/components/SkeletonLoading";
import ChartDataTable from "./ChartDataTable";
import { RequiredAttributesForm } from "./RequiredAttributes";
import {
  saveSelectedAccounts,
  saveSelectedChart,
  setFoundChart,
  setShowEditConfirmButton,
} from "src/redux/actions/_replicationActions";
import Conditional from "src/components/Conditional";
import CustomSelect from "src/components/CustomSelect";
import context from "../../../advertReplicationContext";

const ChartSize = () => {
  const dispatch = useDispatch();
  const { advertBeingEdited } = useSelector(state => state.advertsReplication);
  const [isLoadingDomain, setIsLoadingDomain] = useState(false);
  const [isLoadingAttr, setIsLoadingAttr] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [domain, setDomain] = useState("");
  const [requiredAttrs, setRequiredAttrs] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedAccount, setSelectedAccount] = useState([]);
  const [isLoadingChartSpecific, setIsLoadingChartSpecific] = useState(false);
  const [charts, setCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState();
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("");

  const { checkAdvert } = useContext(context);

  const sizeGridAttr = useMemo(
    () => advertBeingEdited?.attributes?.filter(attr => attr.id === "SIZE_GRID_ID")[0],
    [advertBeingEdited],
  );

  const mlAccounts = Object.values(useSelector(state => state.accounts.accounts))?.filter(
    account => account.internal_status === 1 && account.platform === "ML",
  );

  const handleSelectAccount = account => {
    if (chartType === "SPECIFIC") {
      dispatch(saveSelectedAccounts([account]));
    } else {
      setSelectedAccount([account]);
    }
  };

  const handleGetChartData = async () => {
    try {
      if (mlAccounts.length && sizeGridAttr.value_name) {
        setIsLoadingChart(true);
        const { data } = await api.get(`/charts/${sizeGridAttr?.value_name}/account/${mlAccounts[0].id}`);
        if (data.statusCode === 200) {
          setChartData(data.data);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleGetDomainByCategory = async () => {
    try {
      setIsLoadingDomain(true);
      const { data } = await api.post(`categories-tree?category_id=${advertBeingEdited.category_id}`);
      setDomain(data.data.domain_id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDomain(false);
    }
  };

  const handleGetRequiredAttributes = async () => {
    try {
      setIsLoadingAttr(true);
      const { data } = await api.get(`charts?domain=${domain}`);
      setRequiredAttrs(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAttr(false);
    }
  };

  const handleGetSpecificCharts = async () => {
    try {
      setIsLoadingChartSpecific(true);
      const requiredIds = requiredAttrs.map(attr => attr.id);
      const attributes = advertBeingEdited?.attributes?.filter(attribute =>
        requiredIds.includes(attribute.id),
      );

      const postObject = {
        account_id: selectedAccount[0].id,
        domain_id: domain.split("-")[1],
        attributes,
      };

      const { data } = await api.post("/charts", postObject);

      const chartTypes = [
        { type: "BRAND", title: "Selecione uma tabela da marca" },
        { type: "STANDARD", title: "Selecione uma tabela oficial" },
        { type: "SPECIFIC", title: "Selecione uma tabela personalizada" },
      ];

      const chart = chartTypes.find(({ type }) => data.data[type]?.charts?.length);

      if (chart) {
        setCharts(data.data[chart.type].charts);
        setChartTitle(chart.title);
        setChartType(chart.type);
      } else {
        dispatch(setShowEditConfirmButton(false));
        checkAdvert({ id: advertBeingEdited.id, checked: false });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingChartSpecific(false);
    }
  };

  const isLoading = () => isLoadingDomain || isLoadingAttr || isLoadingChart;

  const handleSelectChart = selected => {
    setSelectedChart(selected);
    dispatch(saveSelectedChart(selected.id));
    dispatch(setShowEditConfirmButton(true));
  };

  const RenderTitleChart = () => {
    return (
      <h4 className="mt-2">
        Tabela de medidas
        <strong>
          {" "}
          -{" "}
          {requiredAttrs.length ? (
            <b>
              Informar <strong className="text-danger">*</strong>
            </b>
          ) : (
            "Oficial"
          )}
        </strong>
      </h4>
    );
  };

  useEffect(() => {
    handleGetChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chartData.status === 403) {
      handleGetDomainByCategory();
      dispatch(setShowEditConfirmButton(false));
    } else {
      dispatch(setFoundChart(true));
      dispatch(setShowEditConfirmButton(true));
    }

    if (domain) handleGetRequiredAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, domain]);

  useEffect(() => {
    if (selectedAccount.length) {
      handleGetSpecificCharts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount]);

  useEffect(() => {
    if (!charts.length) {
      dispatch(setFoundChart(false));
    }
  }, [charts, dispatch]);

  return (
    <Conditional render={sizeGridAttr}>
      <Conditional render={isLoading()}>
        <CCol>
          <Skeleton.Line height={42} />
        </CCol>
      </Conditional>
      <Conditional render={!isLoading()}>
        <CCol>
          <RenderTitleChart />
          <CCol>
            <Conditional render={requiredAttrs.length}>
              <RequiredAttributesForm
                categoryRequiredAttributes={advertBeingEdited?.attributes?.filter(attribute =>
                  requiredAttrs.map(attr => attr.id).includes(attribute.id),
                )}
              />
              <CRow className="mt-3">
                <CCol className="mb-1">
                  <CustomSelect placeholder="Selecione uma conta ML..." value={selectedAccount[0]?.name}>
                    <CustomSelect.Accounts onSelect={handleSelectAccount} platform="ML" />
                  </CustomSelect>
                </CCol>
              </CRow>
              <Conditional render={selectedAccount.length}>
                <Conditional render={isLoadingChartSpecific}>
                  <CCol style={{ padding: 0 }} className="mt-2">
                    <Skeleton.Line height={42} />
                  </CCol>
                </Conditional>
                <Conditional render={!isLoadingChartSpecific}>
                  <Conditional render={charts.length}>
                    <div className="mt-2">
                      <CustomSelect placeholder={chartTitle} value={selectedChart?.name}>
                        <CustomSelect.Charts charts={charts} onSelect={handleSelectChart} />
                      </CustomSelect>
                    </div>
                  </Conditional>
                  <Conditional render={!charts.length}>
                    <div>Nenhuma tabela encontrada...</div>
                  </Conditional>
                </Conditional>
              </Conditional>
            </Conditional>
            <Conditional render={!requiredAttrs.length && chartData && chartData.names}>
              <ChartDataTable rows={chartData.names} />
            </Conditional>
          </CCol>
        </CCol>
      </Conditional>
    </Conditional>
  );
};

export default ChartSize;
