import { useCallback } from "react";

const useTranslateShippingModeName = () => {
  return useCallback(shippingModeId => {
    return (
      {
        me1: "Mercado Envios 1",
        me2: "Mercado Envios 2",
        custom: "Personalizado",
        not_specified: "Não especificado",
      }[shippingModeId] || shippingModeId
    );
  }, []);
};

export default useTranslateShippingModeName;
