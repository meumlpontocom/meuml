import React from "react";

export default function AdvertCategory({
  advertCatalogListing,
  itemRelations,
  catalogProductName,
  advertIsEligible,
}) {
  if (advertCatalogListing && itemRelations?.length > 0) {
    return (
      <>
        {/* <br /> */}
        <span>
          <i className="cil-tag ml-1 mr-1" />
          Nome Original:{" "}
          <small>
            {itemRelations?.length > 0
              ? itemRelations[0]?.original_title
              : "Não há"}
          </small>
        </span>
      </>
    );
  } else if (!advertCatalogListing && advertIsEligible) {
    return (
      <>
        {/* <br /> */}
        <span>
          <i className="cil-tag ml-1 mr-1" />
          Nome de Catálogo:{" "}
          <small>{catalogProductName ? catalogProductName : "Não há."}</small>
        </span>
      </>
    );
  }

  return (
    <>
      {/* <br /> */}
      <span style={{ color: "gray" }}>
        <i className="cil-tag ml-1 mr-1" />
        Nome de Catálogo:{" "}
        <small>{catalogProductName ? catalogProductName : "Não há."}</small>
      </span>
    </>
  );
}
