import { useContext }               from "react";
import CloseModalBtn                from "./CloseModalBtn";
import CustomModal                  from "../../CustomModal";
import paymentContext               from "../../../paymentContext";
import PayerDataModalContent        from "./PayerDataModalContent";
import useModalController           from "src/views/Payment/hooks/useModalController";

function PayerDataFormModal() {
  const { state }                    = useContext(paymentContext);
  const { setShowUserDataFormModal } = useModalController();
  return (
    <CustomModal
      color="primary"
      borderColor="primary"
      closeButton={true}
      closeOnBackdrop={false}
      show={state.showUserDataFormModal}
      setShow={(bool) => setShowUserDataFormModal(bool)}
      title="Dados Pessoais"
      body={<PayerDataModalContent />}
      footer={<CloseModalBtn />}
    />
  );
}

export default PayerDataFormModal;
