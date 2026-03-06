import { useCallback }   from "react";
import { CButton }       from "@coreui/react";
import { FaTimesCircle } from "react-icons/fa";
import { useHistory }    from "react-router-dom";

function ClosePaymentBtn() {
  const history = useHistory();

  const handleBtnClick = useCallback(() => {
    history.goBack();
    localStorage.removeItem("@MeuML-PaymentURL");
  }, [history]);

  return (
    <CButton
      block
      type="button"
      color="secondary"
      variant="outline"
      onClick={handleBtnClick}
    >
      <FaTimesCircle className="mb-1" />
      &nbsp;Fechar esta tela
    </CButton>
  );
}

export default ClosePaymentBtn;
