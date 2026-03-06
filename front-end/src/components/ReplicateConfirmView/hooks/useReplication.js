import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import replicateSelf from "../replicateSelf";
import { setLoading } from "../../../redux/actions/_replicationActions";
import replicateAdvert from "../../../views/Anuncios/Replicador/Main/replicateAdverts";

const useReplication = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const advertsURL = useSelector(state => state.advertsURL);
  const selectedAdvertsState = useSelector(state => state.selectedAdverts);
  const advertsFiltersState = useSelector(state => state.advertsFilters);
  const toggleLoading = useCallback(() => dispatch(setLoading()), [dispatch]);
  const {
    query,
    searchType,
    selectAll,
    selectedAdverts,
    selectedException,
    warrantType,
    warrantTime,
    allow_duplicated_title,
    allow_duplicated_account,
    allow_copying_warranty,
    bulkEdit,
    priceActions,
    selectedShippingMode,
    selectedAccounts,
    self,
    create_without_warranty,
    shipping_term,
    copyShippingTerm,
    queryParams,
    replication_mode,
    selectedOfficialStore,
  } = useSelector(state => state.advertsReplication);

  const validateWarranty = useCallback(
    () => !create_without_warranty && (!warrantTime || !warrantType || warrantType === "select"),
    [create_without_warranty, warrantTime, warrantType],
  );

  const alertNow = useCallback(async ({ text, type }) => {
    await Swal.fire({
      title: "Atenção!",
      text,
      type: type || "warning",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: "Fechar",
    });
    return false;
  }, []);

  const validateDeliveryDelayTime = useMemo(
    () => !selectedShippingMode && (shipping_term < 0 || shipping_term > 45),
    [selectedShippingMode, shipping_term],
  );

  const validation = useCallback(async () => {
    if (validateWarranty())
      return await alertNow({ text: "As informações sobre GARANTIA são obrigatórias!" });
    else if (!selectedAccounts.length)
      return await alertNow({ text: "Selecione ao menos uma conta para continuar!" });
    else if (!selectedShippingMode)
      return await alertNow({ text: "As informações sobre FRETE são obrigatórias!" });
    else if (validateDeliveryDelayTime)
      return await alertNow({
        text: "Utilize no mínimo 0 e no máximo 45 para o prazo de envio.",
        type: "error",
      });
    else return true;
  }, [alertNow, selectedAccounts.length, selectedShippingMode, validateDeliveryDelayTime, validateWarranty]);

  const requestCommonParams = useMemo(() => {
    return {
      priceActions,
      toggleLoading,
      selectedAccounts,
      selectedException,
      warrantType,
      warrantTime,
      allow_duplicated_title,
      allow_duplicated_account,
      bulkEdit,
      dispatch,
      selectedShippingMode,
      create_without_warranty,
      shipping_term,
      replication_mode,
      selectedOfficialStore,
    };
  }, [
    allow_duplicated_account,
    allow_duplicated_title,
    bulkEdit,
    create_without_warranty,
    dispatch,
    priceActions,
    selectedAccounts,
    selectedException,
    selectedShippingMode,
    shipping_term,
    toggleLoading,
    warrantTime,
    warrantType,
    replication_mode,
    selectedOfficialStore,
  ]);

  const submitRequest = useCallback(async () => {
    const validPayload = await validation();
    if (validPayload && !self) {
      return await replicateAdvert({
        ...requestCommonParams,
        confirmed: 0,
        query,
        searchType,
        queryParams,
        selectAll,
        selectedAdverts,
        allow_copying_warranty: false,
        copyShippingTerm: false,
      });
    }
    if (validPayload && self) {
      return await replicateSelf({
        ...requestCommonParams,
        filterString: advertsURL,
        history,
        selectedAdvertsState,
        advertsFiltersState,
        allow_copying_warranty,
        copyShippingTerm,
        replication_mode,
        selectedOfficialStore,
      });
    }
  }, [
    validation,
    self,
    requestCommonParams,
    query,
    searchType,
    queryParams,
    selectAll,
    selectedAdverts,
    advertsURL,
    history,
    selectedAdvertsState,
    advertsFiltersState,
    allow_copying_warranty,
    copyShippingTerm,
  ]);

  return { submitRequest };
};

export default useReplication;
