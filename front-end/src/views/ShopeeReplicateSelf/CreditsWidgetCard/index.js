import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, saveAvailableCredits } from "../../../redux/actions/_replicationActions";
import Swal from "sweetalert2";
import formatMoney from "../../../helpers/formatMoney";
import api from "../../../services/api";
import { getToken } from "../../../services/auth";

import ReplicationInfoCard from "../../../components/ReplicationInfoCard";

const CreditsWidgetCard = () => {
  const dispatch = useDispatch();
  const { availableCredits } = useSelector(state => state.advertsReplication);
  const toggleIsLoading = () => dispatch(setLoading());

  useEffect(() => {
    const setAvailableCredits = credits => dispatch(saveAvailableCredits(credits));
    async function fetchAvailableCredits() {
      try {
        toggleIsLoading();
        const url = "/credits/available";
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (response.data.status === "success") {
          switch (response.data.message) {
            case "Sua conta ainda não possui créditos":
              setAvailableCredits(0);
              break;
            case "Créditos":
              setAvailableCredits(response.data.data.amount);
              break;
            default:
              setAvailableCredits(0);
              break;
          }
        }
      } catch (error) {
        Swal.fire({
          type: "error",
          text: error?.response ? error?.response?.data?.message : error?.message ? error.message : error,
        });
      } finally {
        toggleIsLoading();
      }
    }
    if (!availableCredits) fetchAvailableCredits();
    return () => availableCredits;
  }, []); //eslint-disable-line
  return <ReplicationInfoCard title="créditos disponíveis" value={formatMoney(availableCredits)} />;
};

export default CreditsWidgetCard;
