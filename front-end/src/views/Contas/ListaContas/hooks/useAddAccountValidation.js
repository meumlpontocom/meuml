import { useCallback, useMemo } from "react";
import Swal                     from "sweetalert2";
import { useDispatch }          from "react-redux";
import { apiGet }               from "src/containers/data/admin/fetch";

const useAddAccountValidation = () => {
  const dispatch = useDispatch();

  const cleanLocalStorage = useCallback(() => {
    localStorage.removeItem("@MeuML#MLAddAccCB");
  }, []);

  const localStorageCallbackResult = useMemo(() => {
    const fromStorage = localStorage.getItem("@MeuML#MLAddAccCB");
    if (fromStorage) {
      const { status, message } = JSON.parse(fromStorage);
      return { status, message };
    } else return null;
  }, []);

  const validationMessage = useCallback(async () => {
    if (!!localStorageCallbackResult) {
      await apiGet({ url: "/accounts", dispatch });
      await Swal.fire({
        title: "Atenção",
        text: localStorageCallbackResult.message,
        type: localStorageCallbackResult.status,
      }).then(() => {
        cleanLocalStorage();
      });
    }
  }, [cleanLocalStorage, dispatch, localStorageCallbackResult]);

  return [validationMessage];
};

export default useAddAccountValidation;
