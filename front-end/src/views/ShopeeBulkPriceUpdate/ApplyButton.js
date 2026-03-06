import CIcon from '@coreui/icons-react'
import { CButton } from '@coreui/react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import LoadingCardData from 'src/components/LoadingCardData'
import api from 'src/services/api'
import { getToken } from 'src/services/auth'
import Swal from 'sweetalert2'

export default function ApplyButton({ adverts, className, percentage, history }) {
  const [isLoading, setIsLoading] = useState(() => false);
  const selectedAccounts = useSelector(state =>
    state.shopee.advertising.selectedAccounts.map(account => account.value)
  );
  const { selectAll, filters } = useSelector(state => state.shopee.advertising);

  const getShopeeAdvertsFilters = () => {
    let query = "";
    for (const filterName in filters) {
      if (filters[filterName].length && typeof filters[filterName] !== "string") {
        const valuesFromCurrentFilter = filters[filterName].map(filterObject => {
          return filterObject.value;
        }).join(",");
        query = `${query}&${filterName}=${valuesFromCurrentFilter}`;
      }
      else if (filterName === "string" && filters[filterName] !== "") {
        query = `${query}&filter_string=${filters[filterName]}`
      }
    }
    if (selectedAccounts.length) {
      query = `${query}&filter_account=${selectedAccounts}`;
    }
    return query;
  }

  async function postRequest({ confirmed = 0 }) {
    try {
      setIsLoading(() => true);
      const queryFilters = getShopeeAdvertsFilters();
      const queryParameters = `confirmed=${confirmed}&select_all=${selectAll ? 1 : 0}`;
      const url = `/shopee/advertisings/alter-price?${queryParameters}${queryFilters}`;
      const payload = {
        is_percentage: true,
        change_type: "INCREASE",
        change_value: percentage,
        advertisings_id: adverts.map(advert => advert.id)
      }
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      }
      const response = await api.post(url, payload, config);
      if (response.data.status === "success") {
        const {value} = await Swal.fire({
          title: "Atenção",
          type: !confirmed ? "question" : response.data.status,
          text: response.data.message,
          showCloseButton: true,
          showConfirmButton: !confirmed ? true : false,
          showCancelButton: true,
          cancelButtonText: !confirmed ? "Cancelar" : "Ok",
          confirmButtonText: "Confirmar"
        });
        if (value === true) {
          postRequest({ confirmed: 1 });
        } else history.goBack();
      }
    } catch (error) {
      Swal.fire({
        type: "error",
        showCloseButton: true,
        text: error.response?.data.message || error.message
      })
    } finally {
      setIsLoading(() => false);
    }
  }

  return !isLoading ? (
    <CButton
      color="primary"
      onClick={postRequest}
      className="float-right"
      disabled={className === "is-invalid" || className === ""}
    >
      <CIcon name="cil-check" alt="V" />
      {" "}Aplicar
    </CButton>
  ) : (
      <LoadingCardData />
    )
}
