import React from "react";
import { DropDown } from "../../../../../components/buttons/ButtonGroup";
// import PositioningHistory from "./PositioningHistory";
import ViewsHistory from "./ViewsHistory";
import ImgQualityDetails from "./ImgQualityDetails";
import QualityDetails from "./QualityDetails";

export default function GoToDetailsBtn({ adExternalId, adAccountId, secureThumbnail, adTitle }) {
  return (
    <td className="text-center" id="goToDetailsBtn" name="goToDetailsBtn">
      <DropDown
        style={{ zIndex: "inherit" }}
        direction="down"
        caret={true}
        color="primary"
        title={
          <span>
            <span className="cil-cog mr-1" />
            Opções
          </span>
        }
      >
        <QualityDetails
          title={adTitle}
          externalId={adExternalId}
          accountId={adAccountId}
          thumbnail={secureThumbnail}
        />
        {/* <PositioningHistory id={adExternalId} /> */}
        <ViewsHistory id={adExternalId} />
        <ImgQualityDetails
          accountId={adAccountId}
          advertId={adExternalId}
          secureThumbnail={secureThumbnail}
        />
      </DropDown>
    </td>
  );
}
