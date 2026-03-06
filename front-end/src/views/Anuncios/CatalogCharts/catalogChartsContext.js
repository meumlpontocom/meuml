import { createContext } from "react";

const catalogChartsContext = createContext(undefined);
catalogChartsContext.displayName = "CatalogChartsContext";
const { Provider, Consumer } = catalogChartsContext;

export { catalogChartsContext, Provider, Consumer }
