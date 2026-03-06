import React        from "react";
import CallToAction from "src/views/CallToAction";

const SubscriptionWrapper = ({ children, apiResponse }) => {
  if (apiResponse?.statusText === "PAYMENT REQUIRED") {
    return <CallToAction />;
  }

  return children;
};

export default SubscriptionWrapper;
