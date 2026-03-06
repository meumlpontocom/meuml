import { useState, useCallback } from "react";
import { useDispatch }           from "react-redux";
import Swal                      from "sweetalert2";
import api                       from "src/services/api";
import { getToken }              from "src/services/auth";
import { requestPayment }        from "src/redux/actions";

function useBuyCredits() {
  const dispatch = useDispatch();
  const [redirectToPayment, setRedirectToPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const postBuyCreditsRequest = useCallback(async (creditsOrderValue) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("credits_amount", creditsOrderValue);
      const {
        data: {
          status,
          data: {
            id,
            // user_id,
            total_price,
          },
        },
      } = await api.post("/credits/buy", formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (status === "success") {
        dispatch(
          requestPayment({
            checkoutId: id,
            total: Number(total_price),
            orderType: "credits",
          }),
        );
        setRedirectToPayment(true);
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
  }, [dispatch]);

  return [redirectToPayment, postBuyCreditsRequest, isLoading];
}

export default useBuyCredits;
