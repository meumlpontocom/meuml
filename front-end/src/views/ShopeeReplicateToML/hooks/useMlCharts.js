/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useCallback, useState } from "react";
import api, { headers } from "../../../services/api";
import shopeeMlReplicationContext from "../shopeeReplicateToMLContext";

const useMlCharts = () => {
  const {
    selectedAccounts,
    selectedCategory,
    form: { charts },
    setChartOptions,
  } = useContext(shopeeMlReplicationContext);

  const [isLoading, setIsLoading] = useState(false);
  const [chartsRequiredAttributes, setChartsRequiredAttributes] = useState({});

  const fetchChartsRequiredAttributes = useCallback(async () => {
    const accountId = selectedAccounts.length > 0 ? selectedAccounts[0].id : "";

    try {
      setIsLoading(true);
      const url = `/charts?domain=${selectedCategory.domain_id}&account_id=${accountId}`;
      return await api.get(url, headers());
    } catch (error) {
      console.log(error);
      return error.response || null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory.domain_id, api, headers]);

  const fetchCharts = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = "/charts";
      const payload = {
        account_id: selectedAccounts[0].id,
        domain_id: selectedCategory.domain_id.split("MLB-")[1],
        attributes: Object.keys(charts)
          .map(attributeId => {
            const attribute = chartsRequiredAttributes.find(({ id }) => id === attributeId);
            const selectedValue = attribute.values?.find(({ name }) => name === charts[attributeId]);
            return {
              id: attributeId,
              name: attribute.name,
              value_id: selectedValue?.id || null,
              value_name: selectedValue?.name || null,
              values: selectedValue ? [selectedValue] : [],
            };
          })
          .filter(attribute => !!attribute.value_id && attribute.value_name),
      };
      if (payload.attributes.length) {
        return await api.post(url, payload, headers());
      } else {
        throw new Error("Preencha os atributos obrigatórios.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccounts, selectedCategory.domain_id, charts, chartsRequiredAttributes, api, headers]);

  useEffect(() => {
    if (selectedCategory.domain_id && !isLoading) {
      fetchChartsRequiredAttributes().then(response => {
        if (response.data.data.length) {
          setChartsRequiredAttributes(response.data.data);
        }
      });
    }
  }, [selectedCategory.domain_id, fetchChartsRequiredAttributes, setChartsRequiredAttributes]);

  useEffect(() => {
    const formIsFullfilled = Object.keys(charts).length === chartsRequiredAttributes.length;
    if (formIsFullfilled) {
      fetchCharts().then(response => {
        if (response?.data?.data) {
          setChartOptions(response.data.data);
        }
      });
    }
  }, [charts, chartsRequiredAttributes, fetchCharts, setChartOptions]);

  return [isLoading, chartsRequiredAttributes];
};

export default useMlCharts;
