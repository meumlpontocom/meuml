import { CButton }        from "@coreui/react";
import { FaThumbsUp }     from "react-icons/fa";
import useModalController from "src/views/Payment/hooks/useModalController";

function CloseModalBtn() {
  const { setShowUserDataFormModal } = useModalController();
  return (
    <CButton
      type="button"
      color="primary"
      size="lg"
      onClick={() => setShowUserDataFormModal(false)}
    >
      Okay!&nbsp;
      <FaThumbsUp className="mb-1" />
    </CButton>
  );
}

export default CloseModalBtn;
