import createShopeeFilterQuery from "src/helpers/createShopeeFilterQuery";
import Swal from "sweetalert2";
import {
  setAdverts,
  setLoading,
  setAdvertsPagination,
  setSelectedAccountList,
} from "../../redux/actions/_shopeeActions";
import api from "../../services/api";
import { getToken } from "../../services/auth";

export default async function fetchShopeeAdverts({ page, dispatch, selectedAccounts, filters }) {
  try {
    dispatch(setLoading(true));

    const accountsFilter = selectedAccounts?.length
      ? "filter_account=" + selectedAccounts.map(({ value }) => value) + "&"
      : "";

    const filtersString = `${accountsFilter}${createShopeeFilterQuery(filters)}page=${page}`;
    const url = `/shopee/advertisings?${filtersString}`;
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    dispatch(setAdverts(response.data.data));
    dispatch(setSelectedAccountList(selectedAccounts));
    if (response.data.meta) {
      dispatch(setAdvertsPagination(response.data.meta));
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      type: "error",
      text: error.response?.data?.message || error?.message || error
    });
  } finally {
    dispatch(setLoading(false));
  }
};
