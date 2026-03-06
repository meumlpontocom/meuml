import React from "react";
import { useSelector } from "react-redux";

export default function CatalogListing({ id }) {
  const { catalog_listing } = useSelector((state) => {
    const { adverts } = state.advertsReplication;
    const advert = adverts.filter((advert) => advert.id === id);
    return advert[0];
  });
  return (
    <span className="text-muted">
      <i className="cil-spreadsheet mr-1" /> Anúncio no catálogo:
      <span className={`${catalog_listing ? "text-success" : "text-warning"}`}>
        {catalog_listing ? " Sim" : " Não"}
      </span>
    </span>
  );
}
