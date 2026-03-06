import React from "react";
import { useSelector } from "react-redux";
import formatMoney from "../../../../helpers/formatMoney";

const PaymentDetailsComplete = ({ id }) => {
  const { sales } = useSelector((state) => state.sales);
  const sale = sales[id];
  const { payments } = sale;

  return (
    <div className="h-100">
      <div className="border border-dark rounded payments-complete-card h-100">
        <div className="sales-header d-flex justify-content-between p-2 items-header">
          <p className="salescard-body-title mb-0 ">Pagamento</p>
        </div>
        <div className="sales-body p-2 flex-grow-1">
          <div className="payments-complete-column">
            {payments.map((payment, index) => {
              const {
                payment_type,
                status,
                date_approved,
                total_paid_amount,
              } = payment;
              return (
                <div className="payment-single-sale pt-2" key={index}>
                  {payments.length > 1 && (
                    <div>
                      <p className="text-muted m-0 single-sale-badge text-white bg-secondary">
                        {index + 1}
                      </p>
                    </div>
                  )}
                  <div className="mb-0 d-flex justify-content-between">
                    <p className="mb-0 salescard-body-title">Forma: </p>
                    <p className="mb-0 ml-2 mr-auto">{payment_type}</p>
                  </div>
                  <div className="mb-0 d-flex justify-content-between">
                    <p className="mb-0 salescard-body-title">Status: </p>
                    <p className="mb-0 ml-2 mr-auto">{status}</p>
                  </div>
                  <div className="mb-0 d-flex justify-content-between">
                    <p className="mb-0 salescard-body-title">Aprovação: </p>
                    <p className="mb-0 ml-2 mr-auto">
                      {date_approved ? (
                        new Date(date_approved).toLocaleDateString("pt-BR")
                      ) : (
                        <strong>-</strong>
                      )}
                      <span className="text-muted ml-2">
                        {date_approved &&
                          new Date(date_approved).toLocaleTimeString("pt-BR")}
                      </span>
                    </p>
                  </div>
                  <div className="mb-0 d-flex justify-content-betwen pb-2">
                    <p className="mb-0 salescard-body-title">Total: </p>
                    <p className="mb-0 ml-2 mr-auto">
                      {formatMoney(total_paid_amount)}
                    </p>
                  </div>
                  {payments.length > 1 && (
                    <div className="p-0 m-0 border-bottom"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsComplete;
