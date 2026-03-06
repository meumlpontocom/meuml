import React, { useEffect, useState } from "react";
import classNames from "classnames";
import Main from "./components/Main";
import { Provider } from "./SearchPublicInfo.context";
import useIsXsDisplay from "../ShopeeReplicateToML/hooks/useIsXsDisplay";
import Swal from "sweetalert2";

const SearchPublicInfo = () => {
  const [searchResult, setSearchResult] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isBtnBlock = classNames(useIsXsDisplay() && "btn-block");

  useEffect(() => {
    Swal.fire({
      title: "Funcionalidade descontinuada",
      type: "error",
      html: `<div>
              Não é mais possível pesquisar informações publicas através da integração, apenas diretamente pelo Mercado Livre.
            </div>`,
      showConfirmButton: true,
      confirmButtonText: "OK",
    });
  }, []);

  return (
    <Provider
      value={{
        viewName: "Pesquisar Informações Públicas",
        routePath: "/pesquisar-dados",
        searchResult,
        setSearchResult,
        isBtnBlock,
        isLoading,
        setIsLoading,
      }}
    >
      <Main />
    </Provider>
  );
};

export default SearchPublicInfo;
