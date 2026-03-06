import React, { useState } from "react";
import api from "../../../../../../services/api";
import { getToken } from "../../../../../../services/auth";
import Reactotron from "reactotron-react-js";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

function toBRCurrency(numberToBeConverted) {
  return numberToBeConverted.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function BestPrice({ advertId, catalogListing }) {
  const advertCurrentPrice = useSelector((state) =>
    toBRCurrency(state.catalog.advertising[advertId].price)
  );
  const url = `/best-price/advertisings/${advertId}`;
  const [hover, setToggleHover] = useState(false);

  function toggleHover() {
    setToggleHover((previous) => !previous);
  }

  const fetchApi = async () => {
    try {
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return response.data;
    } catch (error) {
      return error.response.data || error.message;
    }
  };

  const fetch = () => {
    if (!catalogListing) {
      Swal.fire({
        type: "warning",
        text: "Por favor, certifique-se de que o anúncio em questão pertence ao catálogo.",
        showCloseButton: true,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Ok",
      });
    } else {
      fetchApi()
        .then((data) => {
          if (data.status === "success") {
            const isWinning = data.data.is_winner;
            const winnerPrice = toBRCurrency(data.data.winner_price);
            const text = data.reason?.length
              ? data.reason.join(" ")
              : `O preco atual deste anuncio é ${advertCurrentPrice}. ${isWinning
                ? "Seu anuncio esta atualmente liderando no posicionamento de catálogo."
                : `Seu anuncio esta atualmente perdendo no posicionamento de catálogo. Para pular para a primeira posicao, o preco deve chegar em ${winnerPrice}`
              }`;
            Swal.fire({
              title: "Atenção",
              text,
              showCancelButton: true,
              showConfirmButton: true, //!!data.winner_price,
              cancelButtonText: "Cancelar",
              confirmButtonText: "Aplicar Desconto",
              type: "question",
            }).then((user) => {
              if (user.value) {
                (async () => {
                  try {
                    const url = `/best-price/advertisings/${advertId}?price=${data.data.winner_price}`;
                    const response = await api.put(
                      url,
                      {},
                      {
                        headers: { Authorization: `Bearer ${getToken()}` },
                      }
                    );
                    Swal.fire({
                      title: "Atenção",
                      text: response.data.message,
                      status: response.data.status,
                      showCloseButton: true,
                    });
                  } catch (error) {
                    Reactotron.error(error);
                    Swal.fire({
                      title: "Erro!",
                      text: error.response?.data.message || error,
                      type: "error",
                      showCloseButton: true,
                    });
                  }
                })();
              }
            });
          } else {
            Swal.fire({
              type: "error",
              text: data.message,
              showCloseButton: true,
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonText: "Ok",
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            type: "warning",
            text: error.response?.data.message || error.message,
            showCloseButton: true,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: "Ok",
          });
        });
    }
  };

  return (
    <span
      style={{
        borderRadius: "10%",
        color: "tomato",
        cursor: "pointer",
        backgroundColor: hover ? "#f8e6e6" : "",
      }}
      onClick={() => fetch()}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
    >
      <i className="cil-chart-line ml-1 mr-1" />
      Ver Destaque
    </span>
  );
}
