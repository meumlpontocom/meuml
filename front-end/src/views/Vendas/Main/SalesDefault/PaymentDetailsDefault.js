import React from "react";
import { useSelector } from "react-redux";

const PaymentDetailsDefault = ({ id }) => {
  const { sales } = useSelector((state) => state.sales);
  const { payments } = sales[id];

  const paymentInfo = React.useMemo(() => {
    if (payments.length) {
      const mostRecentPayment = payments.reduce(
        (previousObject, currentObject) => {
          if (currentObject?.date_approved && previousObject?.date_approved) {
            const currentDateApproved = new Date(currentObject.date_approved);
            const previousDateApproved = new Date(previousObject.date_approved);

            return currentDateApproved > previousDateApproved
              ? currentDateApproved
              : previousDateApproved;
          }
          return currentObject?.date_approved ? currentObject : previousObject;
        },
        {}
      );

      return mostRecentPayment.status;
    }

    return "";
  }, [payments]);

  return (
    <div
      className="payment-details border border-dark
        rounded p-2 d-flex justify-content-between align-items-center mt-2"
    >
      <p className="salescard-body-title mb-0 mr-2">Pagamento</p>
      <p className="mb-0 mr-auto">{paymentInfo}</p>
    </div>
  );
};

export default PaymentDetailsDefault;
