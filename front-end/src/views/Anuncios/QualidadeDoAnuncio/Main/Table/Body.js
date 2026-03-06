import React from "react";
import Advert from "../Advert";

export default function TableBody({ advertsPositionGrid }) {
  return advertsPositionGrid.length > 0 ? (
    <tbody id="table-body" name="table-body" className="table-card-responsive">
      {advertsPositionGrid
        .map((object, index) => {
          return (
            <Advert
              key={index}
              imgTitle={object.title}
              imgThumbnail={object.secure_thumbnail}
              adTitle={object.title}
              adExternalId={object.external_id}
              adAccountId={object.account_id}
              adAccount={object.account}
              adPosition={object.position}
              quality={object.quality}
              picturesStatus={object.pictures_status}
              status={object.status}
            />
          );
        })
        .sort(function (a, b) {
          return a.adPosition < b.adPosition;
        })}
    </tbody>
  ) : (
    <p className="text-center">Nenhum anúncio encontrado</p>
  );
}
