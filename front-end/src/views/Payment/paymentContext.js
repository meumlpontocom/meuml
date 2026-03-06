import { createContext } from "react";

const paymentContext = createContext(undefined);

export const { Provider, Consumer } = paymentContext;

export default paymentContext;
