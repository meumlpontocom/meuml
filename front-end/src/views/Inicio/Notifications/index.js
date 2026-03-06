import React from "react";
import { Link } from "react-router-dom";
export const ReviewYourAdvertsMessage = ({ closeToast }) => {
  return (
    <div id="reviewYourAdvertsMessage" name="reviewYourAdvertsMessage">
      <h5>
        <b>
          Confira seus <Link to={"/anuncios"}>anúncios</Link>
        </b>
      </h5>
      <p>
        Anúncios elegíveis ao <b>catálogo</b> estão perdendo posicionamento. Confira se você possui{" "}
        <b>
          <Link to={"/anuncios"}>anúncios</Link> elegíveis
        </b>
        , e coloque no catálogo o mais rápido possível para <b>ganhar relevância</b> e <b>vender mais</b>!
      </p>
      <button
        onClick={closeToast}
        style={{
          backgroundColor: "#FFFFFF00",
          border: "none",
          borderColor: "#ffffff00",
          color: "#000",
        }}
      >
        Clique para fechar.
      </button>
    </div>
  );
};
