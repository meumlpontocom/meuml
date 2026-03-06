
import { createContext } from "react";

const initialState = {
   viewName:  "Pesquisar Informações Públicas",
   routePath: "/pesquisar-dados",
   searchResult: {},
   setSearchResult: () => {},
   isLoading: false,
   setIsLoading: () => {}
}

const SearchPublicInfoContext = createContext(initialState);

export const { Consumer, Provider } = SearchPublicInfoContext;
export default SearchPublicInfoContext;