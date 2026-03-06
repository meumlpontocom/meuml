import React, { useContext, useMemo, useState }   from "react";
import { useHistory }                             from "react-router";
import { CCard, CCardBody, CInputGroup, CSelect } from "@coreui/react";
import { FaTable }                                from "react-icons/fa";
import CardHeader                                 from "../atoms/CardHeader";
import { catalogChartsContext }                   from "../catalogChartsContext";
import InputPrependToggleIconLoading              from "./InputPrependToggleIconLoading";
import ToggleShowSelectOptions                    from "../atoms/ToggleShowSelectOptions";

const SelectAvailableCatalogChart = () => {
  const history = useHistory();
  const { catalogCharts, selectedCatalogChart, setSelectChart } = useContext(catalogChartsContext);

  const [isLoading, setIsLoading]           = useState(() => false);
  const [showMoreData, setShowMoreData]     = useState(() => 0);

  const brandOptions        = useMemo(() => catalogCharts["BRAND"],    [catalogCharts]);
  const mercadoLibreOptions = useMemo(() => catalogCharts["STANDARD"], [catalogCharts]);
  const customOptions       = useMemo(() => catalogCharts["SPECIFIC"], [catalogCharts]);

  const loadMoreData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowMoreData(current => current + 1);
      setIsLoading(false);
    }, 1500);
  };

  function handleChange({ target: { value } }) {
    if (value === "load-more-data") {
      loadMoreData();
      setSelectChart("");
    } else {
      setSelectChart(value);
    }
  };

  return Object.keys(catalogCharts)?.length ? (
    <CCard>
      <CardHeader text="Tabelas sugeridas" />
      <CCardBody>
        <CInputGroup>
          <InputPrependToggleIconLoading
            isLoading={isLoading}
            Icon={<FaTable />}
          />
          <CSelect onChange={handleChange} value={selectedCatalogChart} disabled={isLoading}>
            <option value="">Selecione...</option>
            <ToggleShowSelectOptions show={true}               options={brandOptions?.charts || brandOptions} />
            <ToggleShowSelectOptions show={showMoreData >= 1}  options={mercadoLibreOptions?.charts || mercadoLibreOptions} />
            <ToggleShowSelectOptions show={showMoreData >= 2}  options={customOptions?.charts || customOptions} />
            {showMoreData >= 2 && !history.location.state?.id ? <option value="custom">Criar nova tabela</option> : <></>}
            {showMoreData < 2 ? <option value="load-more-data">Carregar mais</option> : <></>}
          </CSelect>
        </CInputGroup>
      </CCardBody>
    </CCard>
  ) : <></>;
};

export default SelectAvailableCatalogChart;
