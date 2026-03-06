import { useMemo, useCallback, useContext } from "react";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import useUploadImgToMl from "./useUploadImgToMl";
import api, { headers } from "../../../services/api";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";

const useReplicate = () => {
  const history = useHistory();
  const uploadImgToMl = useUploadImgToMl();
  const {
    selectedAccounts,
    selectedCategory,
    form: { basic, required },
    chartOptions,
    selectedChartOptions,
    selectedChartRow,
    selectedOfficialStore,
    variationsAmount,
  } = useContext(shopeeReplicateToMLContext);
  const chartsAttributes = useMemo(() => {
    const charts = [];
    const size = !Object.keys(chartOptions).length
      ? undefined
      : [...chartOptions?.BRAND?.charts, ...chartOptions?.SPECIFIC?.charts, ...chartOptions?.STANDARD?.charts]
          .find(chart => chart.id === selectedChartOptions)
          ?.rows.find(({ id }) => id === selectedChartRow)
          ?.attributes.find(({ id }) => id === "SIZE").values[0].name;
    if (selectedChartOptions) {
      charts.push({
        id: "SIZE_GRID_ID",
        value_name: selectedChartOptions,
      });
    }
    if (selectedChartRow) {
      charts.push({
        id: "SIZE_GRID_ROW_ID",
        value_name: selectedChartRow,
      });
    }
    if (size) {
      charts.push({
        id: "SIZE",
        value_name: size,
      });
    }
    return charts;
  }, [chartOptions, selectedChartOptions, selectedChartRow]);

  const validation = useCallback(() => {
    const gtinValidation = basic.gtin_behavior === "overwrite-gtin" ? !!basic.gtin : true;

    const basic_data_validation =
      basic.title?.length &&
      basic.price > 0 &&
      basic.description?.length &&
      (basic.pictures?.length || basic.pictures_shopee?.length) &&
      basic.available_quantity &&
      basic.listing_type_id &&
      basic.condition &&
      gtinValidation &&
      (basic.create_catalog_advertising || basic.create_classic_advertising);
    let required_data_validation = true;
    for (const key in required) {
      if (!required[key]) {
        required_data_validation = false;
        break;
      }
    }
    const chartsValidation =
      chartOptions.BRAND && chartOptions.SPECIFIC && chartOptions.STANDARD ? !!selectedChartOptions : true;
    return required_data_validation && basic_data_validation && basic_data_validation && chartsValidation;
  }, [basic, required, chartOptions, selectedChartOptions]);

  const createMlAdvertPayload = useCallback(() => {
    const { category_id, id } = selectedCategory;
    const requiredAttributes = Object.entries(required).map(([key, value]) => ({
      id: key,
      value_name: value,
    }));
    const gtin = { id: "GTIN", value_name: basic.gtin };
    const gtinBeavior = { id: "gtin_behavior", value_name: basic.gtin_behavior };
    const attributes = [...requiredAttributes, ...chartsAttributes, gtin, gtinBeavior];
    return {
      accounts_id: selectedAccounts.map(({ id }) => id),
      advertisings: [
        {
          shopee_account_id: history.location.state.account_id,
          shopee_item_id: history.location.state.id,
          category_id: category_id || id,
          attributes,
          ...basic,
          evaluate_eligibility: false,
          official_store_id: selectedOfficialStore ? selectedOfficialStore.id : null,
        },
      ],
      variations_amount: variationsAmount,
    };
  }, [selectedCategory, required, basic, chartsAttributes, selectedAccounts, history, variationsAmount, selectedOfficialStore]);

  const submitReplicationRequest = useCallback(
    async (confirmed = 0, pictures = []) => {
      try {
        const url = `/advertisings/replicate/shopee?confirmed=${confirmed}`;
        const payload = createMlAdvertPayload();
        payload.advertisings[0].pictures = pictures;

        const response = await api.post(url, payload, headers());
        if (response.data.status === "success") {
          const { value } = await Swal.fire({
            title: !confirmed ? "Atenção" : "Solicitação aceita",
            text: response.data.message,
            type: !confirmed ? "question" : "info",
            showConfirmButton: !confirmed,
            showCancelButton: true,
            cancelButtonText: !confirmed ? "Cancelar" : "Fechar",
            confirmButtonText: !confirmed ? "Confirmar" : "Ver PROCESSOS",
            showCloseButton: true,
          });
          if (!confirmed && value) {
            await submitReplicationRequest(1, pictures);
            history.push("/historico-replicacoes");
          }
        }
      } catch (error) {
        await Swal.fire({
          title: "Erro",
          text: error.response?.data?.message || error.message,
          type: "error",
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: "Fechar",
          showCloseButton: true,
        });
      }
    },
    [createMlAdvertPayload, history],
  );
  const handleSubmitReplication = useCallback(async () => {
    if (basic.pictures_shopee?.length) return await submitReplicationRequest(0);
    const { success, error } = await uploadImgToMl();
    if (error === "no-pictures-selected" || error.size) {
      return await Swal.fire({
        title: "Erro!",
        text: Array.isArray(error)
          ? error.join("\n")
          : "Você precisa selecionar pelo menos uma imagem para replicar o anúncio sem imagens originais.",
        type: "error",
        showCancelButton: true,
        showConfirmButton: false,
        showCloseButton: true,
        cancelButtonText: "Fechar",
      });
    } else return await submitReplicationRequest(0, success);
  }, [basic.pictures_shopee?.length, submitReplicationRequest, uploadImgToMl]);

  return [validation, handleSubmitReplication];
};

export default useReplicate;
