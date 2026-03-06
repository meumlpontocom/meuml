import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPredictCategory }                                     from "./requests";
import { useHistory }                                               from "react-router";
import { CCol, CContainer }                                         from "@coreui/react";
import { toast }                                                    from "react-toastify";
import Footer                                                       from "./molecules/Footer";
import { Provider }                                                 from "./catalogChartsContext";
import CatalogChart                                                 from "./organisms/CatalogChart";
import SelectAccount                                                from "./molecules/SelectAccount";
import PageHeader                                                   from "src/components/PageHeader";
import CategorySelect                                               from "./molecules/CategorySelect";
import SearchCategory                                               from "./molecules/SearchCategory";
import SelectAvailableCatalogChart                                  from "./molecules/SelectAvailableCatalogChart";
import CategoryRequiredAttributes                                   from "./molecules/CategoryRequiredAttributes";
import "./index.css";

const CatalogCharts = () => {
  const history = useHistory();
  const searchCategoryInputRef = useRef(null);
  const isLinkingAdverts = useMemo(() => !!history?.location?.state?.id, [history?.location?.state?.id]);

  const [searchKeyword,               setSearchKeyword]               = useState("");
  const [isLoadingCategories,         setIsLoadingCategories]         = useState(false);
  const [isLoadingRequiredAttributes, setIsLoadingRequiredAttributes] = useState(false);
  const [isLoadingCatalogCharts,      setIsLoadingCatalogCharts]      = useState(false);
  const [predictedCategories,         setPredictedCategories]         = useState([]);
  const [selectedCategory,            setSelectedCategory]            = useState({});
  const [disableSearch,               setDisableSearch]               = useState(false);
  const [selectedCatalogChart,        setSelectedCatalogChart]        = useState({});
  const [categoryRequiredAttributes,  setCategoryRequiredAttributes]  = useState([]);
  const [selectedAccount,             setSelectedAccount]             = useState([]);
  const [catalogCharts,               setCatalogCharts]               = useState({});
  const [catalogChartName,            setCatalogChartName]            = useState("");
  const [customRows,                  setCustomRows]                  = useState([]);
  const [selectedRow,                 setSelectedRow]                 = useState({});

  const setSearch                    = useCallback(string  => setSearchKeyword(string),                []);
  const setLoadingCategories         = useCallback(boolean => setIsLoadingCategories(boolean),         []);
  const setLoadingRequiredAttributes = useCallback(boolean => setIsLoadingRequiredAttributes(boolean), []);
  const setLoadingCatalogCharts      = useCallback(boolean => setIsLoadingCatalogCharts(boolean),      []);
  const setCategories                = useCallback(array   => setPredictedCategories(array),           []);
  const setCategory                  = useCallback(object  => setSelectedCategory(object),             []);
  const setSelectChart               = useCallback(object  => setSelectedCatalogChart(object),         []);
  const setRequiredAttributes        = useCallback(array   => setCategoryRequiredAttributes(array),    []);
  const setAccount                   = useCallback(array   => setSelectedAccount(array),               []);
  const setCharts                    = useCallback(object  => setCatalogCharts(object),                []);
  const setChartName                 = useCallback(string  => setCatalogChartName(string),             []);
  const setNewChartRows              = useCallback(array   => setCustomRows(array),                    []);
  const setSelectRow                 = useCallback(object  => setSelectedRow(state => JSON.stringify(object) === JSON.stringify(state) ? {} : object), []);

  const fetchCategories = useCallback(async () => {
    if (searchKeyword) {
      setLoadingCategories(true);
      setDisableSearch(true);
      const predictedCategory = await fetchPredictCategory({ advertTitle: searchKeyword });
      predictedCategory.status === "success" && setCategories(predictedCategory.data);
      setLoadingCategories(false);
      setDisableSearch(false);
    }
  }, [searchKeyword, setCategories, setLoadingCategories]);

  const catalogChartTableData = useMemo(() => {
    if (catalogCharts?.BRAND?.charts && catalogCharts?.SPECIFIC?.charts && catalogCharts?.STANDARD?.charts) {
      const { BRAND, SPECIFIC, STANDARD } = catalogCharts;
      const allChartsOptions = [...BRAND.charts, ...SPECIFIC.charts, ...STANDARD.charts];
      const selectedChart = allChartsOptions.filter(({ id }) => id === selectedCatalogChart)[0];
      return selectedChart;
    }
    return {};
  }, [catalogCharts, selectedCatalogChart]);

  useEffect(() => {
    if (isLinkingAdverts && !selectedAccount.length) {
      toast("Selecione uma conta para continuar.", {
        type: toast.TYPE.INFO,
        autoClose: false,
        closeButton: true,
        closeOnClick: false,
        position: "top-center",
      });
    }

    if (isLinkingAdverts && selectedAccount.length) {
      setSearch(history.location.state.title);
      searchCategoryInputRef.current.disabled = true;
      fetchCategories();
    }
  }, [fetchCategories, isLinkingAdverts, history?.location?.state?.title, selectedAccount.length, setSearch]);

  return (
    <Provider
      displayName="Catalog Charts"
      value={{
        refs: {
          searchCategoryInputRef,
        },
        isLoadingCategories,
        setLoadingRequiredAttributes,
        isLoadingRequiredAttributes,
        setLoadingCatalogCharts,
        isLoadingCatalogCharts,
        setAccount,
        selectedAccount,
        setSearch,
        searchKeyword,
        setCategories,
        predictedCategories,
        setCategory,
        selectedCategory,
        disableSearch,
        setRequiredAttributes,
        categoryRequiredAttributes,
        setCharts,
        catalogCharts,
        setSelectChart,
        selectedCatalogChart,
        catalogChartTableData,
        setChartName,
        catalogChartName,
        fetchCategories,
        customRows,
        setNewChartRows,
        setSelectRow,
        selectedRow,
        isLinkingAdverts
      }}
    >
      <CContainer className="d-flex justify-content-center">
        <CCol xs="12" lg="8">
          <PageHeader heading="Tabela de medidas" subheading="Pesquise, edite, crie" />
          <SelectAccount />
          <SearchCategory />
          <CategorySelect />
          <CategoryRequiredAttributes />
          <SelectAvailableCatalogChart />
          <CatalogChart />
          <Footer />
        </CCol>
      </CContainer>
    </Provider>
  );
};

export default CatalogCharts;
