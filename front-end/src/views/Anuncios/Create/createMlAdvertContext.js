import { createContext } from "react";

const createMlAdvertContext = createContext(undefined);
const { Provider, Consumer } = createMlAdvertContext;

export { createMlAdvertContext, Provider, Consumer }
