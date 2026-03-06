import React, { useContext } from "react";
import context from "./context";
import { Link } from "react-router-dom";
import SelectedAdsAmount from "../../views/Anuncios/PrecoEmMassa/HeaderComp";

export default function Advert() {
  const {
    allowedAdvertising,
    blockedAdvertising,
    allAdvertsSelected
  } = useContext(context);
  return (
    <>
      <SelectedAdsAmount justifyContent="left" />
      {allAdvertsSelected ? (
        <div className="text-left mt-3">
          <h5>
            Esta operação será aplicada a todos os anúncios de contas com o
            plano profissional ou que possuam acesso ao módulo{" "}
            <Link to="/assinaturas/planos">Anúncios em Massa</Link>.
          </h5>
        </div>
      ) : (
        <div className="advertising mt-3">
          {allowedAdvertising.length ? (
            <></>
          ) : (
            <>
              <p className="text-left">
                Nenhuma das contas selecionadas possui este recurso
                <small> (anúncios em massa) </small>assinado.
              </p>
              <p className="text-right mt-5">
                <Link className="btn btn-primary" to="/assinaturas/planos">
                  <i className="cil-pen-alt mr-1" />
                  Saiba mais sobre o Plano Profissional!
                </Link>
              </p>
            </>
          )}
          {blockedAdvertising.length && allowedAdvertising.length ? (
            <>
              <h5 className="advert-list-title mt-3">
                <i className="cil-x-circle mr-1" />
                Um ou mais contas selecionadas não possuem acesso a este
                recurso.
              </h5>
              <p className="text-left">
                {allowedAdvertising.length
                  ? `Anúncios que serão ignorados neste procedimento:
                  ${blockedAdvertising.length}`
                  : null}
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
}
