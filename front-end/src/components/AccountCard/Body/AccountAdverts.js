import React from "react";
import { useSelector } from "react-redux";
import adsIcon from "../../../assets/img/icons/icone_anuncios.svg";

export default function AccountAdverts({ id }) {
  const totalAdverts = useSelector(
    ({ accounts }) => accounts.accounts[id]?.total_advertisings
  );
  return (
    <div className="ads-badge d-inline-flex align-items-center">
      <div className="badge-icon d-flex justify-content-center align-items-center m-0 p-0">
        <img src={adsIcon} alt="ícone de anúncios" className="img-responsive" />
      </div>
      <p className="ml-2 my-0">Anúncios </p>
      <span className="ml-auto mr-3">{totalAdverts}</span>
    </div>
  );
}
