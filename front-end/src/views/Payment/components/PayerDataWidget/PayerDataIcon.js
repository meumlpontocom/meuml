import { useContext } from "react";
import { CSpinner }   from "@coreui/react";
import { FaUser }     from "react-icons/fa";
import paymentContext from "../../paymentContext";

function PayerDataIcon() {
  const { state } = useContext(paymentContext);
  return (
    <h2 className="text-white">
      {state.isLoadingPayerInfo ? <CSpinner color="light" /> : <FaUser />}
    </h2>
  );
}

export default PayerDataIcon;
