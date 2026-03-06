import { useCallback, useContext, useState } from "react";
import Swal                                  from "sweetalert2";
import { useHistory }                        from "react-router-dom";
import paymentContext                        from "../paymentContext";
import { setShowDisclaimerModal }            from "../actions/setShowModal";

/**
 * Returns a object with content navigation utilities for the DisclaimerModal component.
 *
 * @param {string} totalSteps - the total of steps to navigate
 * @return {{ navigate: Function, step: number }}
 * An object with two properties:
 * - navigate: a function to navigate to a informed step. Starts in zero. Limit defined by totalSteps parameter.
 * - step: the current step in the navigation.
 */
function useDisclaimerModalNavigation(totalSteps) {
  const history         = useHistory();
  const [step, setStep] = useState(0);
  const { dispatch }    = useContext(paymentContext);

  const confirmCancel = useCallback(() => {
    Swal.fire({
      title: "Aviso!",
      text: "Tem certeza que deseja voltar? Seu progresso não será salvo.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColorconfirmButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: "Cancelar pagamento",
      cancelButtonText: "Continuar para fatura",
      type: "warning",
    }).then((result) => {
      if (result.isConfirmed || result.value) {
        history.goBack();
      }
    });
  }, [history]);

  const handleClick = useCallback(
    (nextStep) => {
      if (nextStep >= 0 && nextStep <= totalSteps) setStep(nextStep);
      else if (nextStep < 0) confirmCancel();
      else dispatch(setShowDisclaimerModal(false));
    },
    [confirmCancel, totalSteps, dispatch]
  );

  return { navigate: handleClick, step };
}

export default useDisclaimerModalNavigation;