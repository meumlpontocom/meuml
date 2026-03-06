import React, { useContext }        from "react";
import CustomModal                  from "../CustomModal";
import content                      from "./disclaimerTexts";
import DisclaimerContent            from "./DisclaimerContent";
import paymentContext               from "../../paymentContext";
import DisclaimerControllers        from "./DisclaimerControllers";
import useDisclaimerModalNavigation from "../../hooks/useDisclaimerModalNavigation";

function PaymentIssuesModal() {
  const { state }          = useContext(paymentContext);
  const { navigate, step } = useDisclaimerModalNavigation(content.length - 1);
  return (
    <CustomModal
      color="secondary"
      borderColor="dark"
      closeButton={false}
      closeOnBackdrop={false}
      title={content[step][0]}
      show={state.showDisclaimerModal}
      body={<DisclaimerContent step={step} content={content} />}
      footer={<DisclaimerControllers navigate={navigate} step={step} />}
    />
  );
}

export default PaymentIssuesModal;
