import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card, CardHeader, Domains, CategoryTree }                      from "../atoms";
import Swal                                                             from "sweetalert2";
import { fetchPredictCategory }                                         from "../requests";
import { CCardBody }                                                    from "@coreui/react";
import { createMlAdvertContext }                                        from "../createMlAdvertContext";
import LoadingCardData                                                  from "src/components/LoadingCardData";

const Category = () => {
  const { form } = useContext(createMlAdvertContext);
  const [isLoading, setIsLoading] = useState(() => false);
  const [predictedCategory, setPredictedCategory] = useState(() => []);
  const [timeSinceLastKeyPress, setTimeSinceLastKeyPress] = useState(null);

  const shouldRenderComponent = useMemo(() => !!form?.title, [form.title]);

  const predictAdvertCategory = useCallback(async () => {
    setIsLoading(true);
    const response = await fetchPredictCategory({ advertTitle: form.title });
    setIsLoading(false);
    if (response.status === "success") {
      setPredictedCategory(response.data);
    } else {
      await Swal.fire({
        title: "Erro!",
        text: response.message,
        type: "error",
        showCancelButton: true,
        cancelButtonText: "Fechar",
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  }, [form.title]);

  const initTimeout = useCallback(() => {
    setTimeSinceLastKeyPress(currentTimeoutValue => {
      clearTimeout(currentTimeoutValue);
      return setTimeout(predictAdvertCategory, 900);
    });
  }, [predictAdvertCategory]);

  useEffect(() => {
    if (form.title) initTimeout();
    return () => clearTimeout(timeSinceLastKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title]);

  return (
    <Card isVisible={shouldRenderComponent} className="border-primary" id="advert-category-card">
      <CardHeader
        title="Categoria"
        subtitle={<CategoryTree />}
      />
      <CCardBody>
        {(!predictedCategory.length || isLoading) && <LoadingCardData />}
        <Domains predictedCategory={predictedCategory} />
      </CCardBody>
    </Card>
  );
};

export default Category;
