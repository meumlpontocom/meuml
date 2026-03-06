import { toast } from "react-toastify";

const getFromClipboard = async ({ toastError = false, callback = null }) => {
  try {
    const clipboardContent = await navigator.clipboard.readText();

    if (!!callback) callback(clipboardContent);
    else return clipboardContent;
  } catch (error) {
    if (toastError) toast("Erro ao colar conteúdo.", { type: toast.TYPE.ERROR });
    return error;
  }
};

export default getFromClipboard;
