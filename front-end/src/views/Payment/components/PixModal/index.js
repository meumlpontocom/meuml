import { useContext, useEffect } from "react";
import CustomModal               from "../CustomModal";
import PixModalContent           from "./PixModalContent";
import paymentContext            from "../../paymentContext";
import PixModalController        from "./PixModalController";
import useModalController        from "../../hooks/useModalController";

/**
 * Conditionally render the PixModal component to open previous generated invoices,
 * based on the reducer's state showPixModal. Uses the localStorage key @MeuML-PaymentURL.
 *
 * @return {JSX.Element} The rendered CustomModal component.
 */
function PixModal() {
  const { state } = useContext(paymentContext);
  const url       = localStorage.getItem("@MeuML-PaymentURL");
  const { setShowUserDataFormModal, setShowDisclaimerModal, setShowPixModal } =
    useModalController();

  useEffect(() => {
    if (url && !state.showPixModal) {
      setShowDisclaimerModal(false);
      setShowUserDataFormModal(false);
      setShowPixModal(true);
    }
  }, [setShowDisclaimerModal, setShowPixModal, setShowUserDataFormModal, state.showPixModal, url]);

  return (
    <CustomModal
      color="success"
      borderColor="success"
      closeButton={false}
      closeOnBackdrop={false}
      show={state.showPixModal}
      setShow={(bool) => setShowPixModal(bool)}
      title="Pagamento"
      body={<PixModalContent />}
      footer={<PixModalController />}
    />
  );
}

export default PixModal;
