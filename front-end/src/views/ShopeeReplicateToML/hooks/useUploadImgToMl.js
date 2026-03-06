import { useCallback, useContext } from "react";
import api, { headers }            from "../../../services/api";
import shopeeReplicateToMLContext  from "../shopeeReplicateToMLContext";

const useUploadImgToMl = () => {
  const {
    setImgBeingUploaded,
    selectedAccounts,
    form: { basic: { pictures } },
  } = useContext(shopeeReplicateToMLContext);
  return useCallback(async () => {
    if (pictures.length) {
      const url = "/images/meli/upload";
      const images = Array.from(pictures);
      const success = [];
      const error = [];
      for (const img in images) {
        const formData = new FormData();
        formData.append("account_id", selectedAccounts[0].id);
        formData.append("image", images[img]);
        formData.append("title", images[img].name);
        setImgBeingUploaded(images[img].name);
        const response = await api.post(url, formData, headers());
        if (response.data.status !== "success")
          error.push(response.data.message);
        else success.push(response.data.data.id);
        setImgBeingUploaded(null);
      }
      return { success, error: new Set(error) };
    } else return { error: "no-pictures-selected" };
  }, [pictures, setImgBeingUploaded, selectedAccounts]);
};

export default useUploadImgToMl;
