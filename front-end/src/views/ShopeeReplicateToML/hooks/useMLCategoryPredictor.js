import { useCallback, useEffect, useState } from "react";
import PropTypes                            from "prop-types";
import api, { headers }                     from "src/services/api";

const useMLCategoriesPredictor = (advertTitle) => {
  const [predictedCategories, setPredictedCategories] = useState([]);
  const fetchPredictCategories = useCallback(async () => {
    try {
      return await api.get(`/category-predictor?title=${advertTitle}`, headers());
    } catch (error) {
      return error.response || { data: { status: null }};
    }
  }, [advertTitle]);
  useEffect(() => {
    if (advertTitle) {
      fetchPredictCategories().then(response => {
        if (response.data.status === "success") setPredictedCategories(response.data.data);
        else setPredictedCategories("error");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return predictedCategories;
};

useMLCategoriesPredictor.propTypes = {
  advertTitle: PropTypes.string.isRequired,
};

export default useMLCategoriesPredictor;
