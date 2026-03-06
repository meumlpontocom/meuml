import { useCallback, useState } from "react";
import Swal                      from "sweetalert2";

function useFetchViaCep() {
  const [isLoading, setIsLoading] = useState(false);
  const [cep, setCep] = useState("");

  const fetchCepData = useCallback(cep => {
    setIsLoading(true);
    const url = `https://viacep.com.br/ws/${String(cep).trim().replace("-", "").replace(" ", "")}/json/`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if ("erro" in data) {
          Swal.fire({
            type: "error",
            title: "Atenção!",
            html: "<p>CEP inválido. Certifique-se de preencher o formulário com dados válidos para prosseguir.</p>",
            showConfirmButton: true,
            confirmButtonText: "OK",
            showCloseButton: true,
            showCancelButton: false,
          });
        } else setCep(data);
      })
      .catch(error => {
        Swal.fire({
          title: "Erro",
          type: "error",
          text: "Serviço de CEP temporariamente indisponível. Tente novamente em alguns instantes.",
          showCloseButton: true,
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "OK",
        });
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return [cep, fetchCepData, isLoading];
}

export default useFetchViaCep;
