import { createContext } from "react";

const shippingScheduleContext = createContext(undefined);
const { Provider, Consumer } = shippingScheduleContext;
export { 
  Provider, 
  Consumer, 
  shippingScheduleContext as Context 
};
export default shippingScheduleContext;
