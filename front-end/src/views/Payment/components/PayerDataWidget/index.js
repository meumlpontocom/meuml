import { useContext, useEffect, useState }   from "react";
import PayerDataIcon                         from "./PayerDataIcon";
import CardBtnWidget                         from "../CardBtnWidget";
import PayerDataContent                      from "./PayerDataContent";
import paymentContext                        from "../../paymentContext";
import PayerDataFormModal                    from "./PayerDataFormModal";
import { setPayerData, setPayerDataHistory } from "../../actions/setPayerData";
import useFetchPayerInfo                     from "../../hooks/useFetchPayerInfo";
import useModalController                    from "../../hooks/useModalController";
import { setIsLoadingPayerInfo }             from "../../actions/setIsLoadingPayerInfo";

function PayerDataWidget() {
  const { state, dispatch }                           = useContext(paymentContext);
  const { fetchPayerInfo }                            = useFetchPayerInfo();
  const { setShowUserDataFormModal }                  = useModalController();
  const [showAfterDisclaimer, setShowAfterDisclaimer] = useState(false);

  useEffect(() => {
    dispatch(setIsLoadingPayerInfo(true));
    fetchPayerInfo().then((response) => {
      const userDataFound         = response.data?.data?.length;
      const userReadingDisclaimer = state.showDisclaimerModal;
      if (userDataFound) {
        dispatch(setPayerData(response.data.data[0]));
        dispatch(setPayerDataHistory(response.data.data));
      }
      else if (!userDataFound && !userReadingDisclaimer)
        setShowUserDataFormModal(true);
      // Setup interface to show data form after disclaimer modal is closed
      else if (!userDataFound && userReadingDisclaimer)
        setShowAfterDisclaimer(true);
      dispatch(setIsLoadingPayerInfo(false));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If user does not have data, show data form after disclaimer
    if (showAfterDisclaimer && !state.showDisclaimerModal) {
      setShowUserDataFormModal(true);
      setShowAfterDisclaimer(false);
    }
  }, [
    setShowUserDataFormModal,
    showAfterDisclaimer,
    state.showDisclaimerModal,
  ]);

  return (
    <>
      <PayerDataFormModal />
      <CardBtnWidget
        id="payer-info"
        name="payer-info"
        onClick={() => setShowUserDataFormModal(true)}
        icon={<PayerDataIcon />}
        title="Dados da Nota Fiscal"
        color="primary"
        content={<PayerDataContent />}
      />
    </>
  );
}

export default PayerDataWidget;
