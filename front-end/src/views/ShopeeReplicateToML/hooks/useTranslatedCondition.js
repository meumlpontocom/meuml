/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useMemo } from "react";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";

const useTranslatedCondition = () => {
  const { form } = useContext(shopeeReplicateToMLContext);
  const translatedConditions = { new: "Novo", used: "Usado" };
  return useMemo(() => translatedConditions[form.basic.condition], [form.basic.condition]);
};

export default useTranslatedCondition;
