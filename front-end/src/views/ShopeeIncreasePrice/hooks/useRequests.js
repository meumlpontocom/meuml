import { useCallback, useState } from "react"
import { useSelector }           from "react-redux";
import Swal                      from "sweetalert2";
import { useHistory }            from "react-router-dom"
import api, { headers }          from "src/services/api";

const useRequests = ({ percentage, adverts }) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(() => false);
  const { selectAll, filters }    = useSelector(state => state.shopee.advertising);
  const selectedAccounts          = useSelector(state => state.shopee.advertising.selectedAccounts.map(account => account.value));

  const getShopeeAdvertsFilters = useCallback(() => {
    let query = "";
    for (const filterName in filters) {
      if (filters[filterName].length && typeof filters[filterName] !== "string")
        query = `${query}&${filterName}=${filters[filterName].map(filterObject => filterObject.value).join(",")}`;
      else if (filterName === "string" && filters[filterName] !== "")
        query = `${query}&filter_string=${filters[filterName]}`;
    }
    if (selectedAccounts.length) 
      query = `${query}&filter_account=${selectedAccounts}`;
    return query;
  }, [filters, selectedAccounts]);

  const handlePostFormResponse = useCallback(async (response, confirmed) => {
    if (response.data.status === "success") {
      const { value } = await Swal.fire({
        title: "Atenção",
        text: response.data.message,
        type: !confirmed ? "question" : response.data.status,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: !confirmed ? true : false,
        confirmButtonText: "Confirmar",
        cancelButtonText: !confirmed ? "Cancelar" : "Ok"
      });
      return value;
    }
  }, []);

  const postForm = useCallback(async ({ confirmed = 0 }) => {
    try {
      setIsLoading(() => true);
      const queryFilters    = getShopeeAdvertsFilters();
      const queryParameters = `confirmed=${confirmed}&select_all=${selectAll ? 1 : 0}`;
      const url             = `/shopee/advertisings/alter-price?${queryParameters}${queryFilters}`;
      const payload = {
        is_percentage: true,
        change_type: "INCREASE",
        change_value: percentage,
        advertisings_id: adverts.map(advert => advert.id)
      }
      const response = await api.post(url, payload, headers());
      const confirm = await handlePostFormResponse(response, confirmed);
      if (confirm) postForm({ confirmed: 1 });
      else history.goBack();
    } catch (error) {
      await Swal.fire({
        type: "error",
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Fechar",
        text: error.response?.data.message || error.message
      });
    } finally {
      setIsLoading(() => false);
    }
  }, [adverts, getShopeeAdvertsFilters, handlePostFormResponse, history, percentage, selectAll]);

  return [postForm, isLoading];
}

export default useRequests;
