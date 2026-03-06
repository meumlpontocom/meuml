import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";
import formatMoney from "../../../helpers/formatMoney";

const useAvailableCredits = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [availableCreditsNumber, setAvailableCreditsNumber] = useState(0);

  const fetchAvailableCredits = useCallback(async () => {
    try {
      const url = "/credits/available";
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.data.message === "Sua conta ainda não possui créditos") {
        setAvailableCredits(formatMoney(0));
        setAvailableCreditsNumber(0);
      } else {
        setAvailableCredits(formatMoney(response.data.data.amount));
        setAvailableCreditsNumber(response.data.data.amount);
      }
    } catch (error) {
      await Swal.fire({
        type: "error",
        title: "Atenção!",
        text: error.response?.data?.message || error.message || error,
        showCloseButton: true,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: "Fechar",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableCredits();
  }, [fetchAvailableCredits]);

  return [isLoading, availableCredits, availableCreditsNumber];
};

export default useAvailableCredits;
