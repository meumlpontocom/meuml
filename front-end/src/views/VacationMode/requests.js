import api from "../../services/api";
import Swal from "sweetalert2";
import {getToken} from "../../services/auth";

export default class vacationRequests {
  constructor(setLoading, history) {
    this.setLoading = boolean => setLoading(boolean);
    this.history = history;
  }

  async deactivateVacationMode({vacationId}) {
    try {
      this.setLoading(true);
      const url = `/vacation-mode/${vacationId}/deactivate`;
      const response = await api.post(url, {}, {
        headers: {Authorization: `Bearer ${getToken()}`}
      });
      if (response.data.status === "success") {
        await Swal.fire({
          title: "Atenção!",
          type: "success",
          text: response.data.message,
          showConfirmButton: true,
          showCloseButton: true,
          confirmButtonText: "Ok",
        });
        window.location.assign("/#/");
      }
    } catch (error) {
      Swal.fire({
        title: "Erro!",
        text: error.response?.data?.message || error.message || error,
        type: "error",
        showCloseButton: true
      });
    } finally {
      this.setLoading(false);
    }
  }

  async activateVacationMode({
    confirmed = 0,
    selectedAccounts,
    vacationType,
    vacationStarts,
    vacationEnds,
    pause_full
  }) {
    try {
      this.setLoading(true);
      const url = `/vacation-mode/activate?filter_account=${selectedAccounts}&confirmed=${confirmed}`;
      const payload = {
        vacation_type: vacationType,
        starts_at: vacationStarts,
        ends_at: vacationEnds,
        pause_full
      }
      const response = await api.post(url, payload, {
        headers: {Authorization: `Bearer ${getToken()}`}
      });
      if (response.data.status === "success") {
        const user = await Swal.fire({
          title: "Atenção!",
          type: !confirmed ? "question" : "success",
          text: response.data.message,
          showConfirmButton: true,
          showCloseButton: true,
          confirmButtonText: !confirmed ? "Confirmar" : "Ok",
          showCancelButton: !confirmed ? true : false,
          cancelButtonText: "Cancelar"
        });
        if (user.value === true && !confirmed) {
          this.activateVacationMode({
            selectedAccounts,
            confirmed: 1,
            vacationType,
            vacationStarts,
            vacationEnds,
            pause_full
          });
        } else if (confirmed) {
          window.location.assign("/#/");
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Erro!",
        text: error.response?.data?.message || error.message || error,
        type: "error",
        showCloseButton: true
      });
    } finally {
      this.setLoading(false);
    }
  }

  async listVacations() {
    try {
      this.setLoading(true);
      const url = "/vacation-mode";
      const response = await api.get(url, {headers: {Authorization: `Bearer ${getToken()}`}});
      return response.data;
    } catch (error) {
      this.setLoading(false);
      console.error(error);
      Swal.fire({
        title: "Erro!",
        text: error.response?.data?.message || error.message || error,
        type: "error",
        showCloseButton: true
      });
    } finally {
      this.setLoading(false);
    }
  }
}
