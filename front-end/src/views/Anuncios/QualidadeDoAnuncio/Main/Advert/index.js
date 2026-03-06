import React from "react";
import PropTypes from "prop-types";
import { AdvertImg } from "./imports";
import AdvertDetails from "./AdvertDetails";
import GoToDetailsBtn from "../GoToDetailsBtn";
import AdvertQuality from "./AdvertQuality";
import AdvertStatusBadge from "../../../../../components/Adverts/Table/Body/AdvertStatusBadge";
Advert.propTypes = {
  imgTitle: PropTypes.string,
  imgThumbnail: PropTypes.string,
  adTitle: PropTypes.string,
  adExternalId: PropTypes.string,
  adAccount: PropTypes.string,
  adPosition: PropTypes.any,
};

export default function Advert({
  imgTitle,
  imgThumbnail,
  adTitle,
  adExternalId,
  adAccountId,
  adAccount,
  adPosition,
  quality,
  status,
  picturesStatus,
}) {
  return (
    <tr id="table-row" name="table-row">
      <AdvertStatusBadge status={status} />
      <AdvertImg title={imgTitle} thumbnail={imgThumbnail} />
      <AdvertDetails
        id={adExternalId}
        position={adPosition}
        account={adAccount}
        title={adTitle}
        picturesStatus={picturesStatus}
      />
      <AdvertQuality id={adExternalId} quality={quality} />
      <GoToDetailsBtn
        adTitle={adTitle}
        adExternalId={adExternalId}
        adAccountId={adAccountId}
        secureThumbnail={imgThumbnail}
      />
    </tr>
  );
}
