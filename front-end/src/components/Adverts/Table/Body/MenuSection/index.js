import React from "react";
import AdvertOptionsBtn from "../AdvertOptions";

export default function MenuSection({ advert, permissions }) {
  return (
    <td
      style={{
        verticalAlign: "middle",
        minWidth: "100px",
        justifyContent: "space-around",
      }}
      className="options-container"
    >
      <AdvertOptionsBtn
        permissions={permissions?.permissions}
        itemRelations={advert.external_data.item_relations}
        advertId={advert.external_id}
        catalogListing={advert.external_data.catalog_listing}
        ad={advert}
      />
    </td>
  );
}
