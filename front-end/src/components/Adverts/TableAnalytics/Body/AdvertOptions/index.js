import React from "react";
import AlterText from "./AlterText";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ReplaceText from "./ReplaceText";
import DiscountBtn from "./DiscountBtn";
import FlexShipping from "./FlexShipping";
import HeaderFooter from "./HeaderFooter";
import RemoveDiscountBtn from "./RemoveDiscountBtn";
import { DropDown } from "../../../../buttons/ButtonGroup";
import AlterManufacturingTime from "./AlterManufacturingTime";
import CatalogCharts from "./CatalogCharts";

const DropDownMenuStyles = styled.div`
  .dropdown-menu {
    min-width: fit-content;
  }
`;

export default function AdvertOptionsBtn({ advertId, ad }) {
  return (
    <DropDownMenuStyles>
      <DropDown
        direction="left"
        caret={true}
        color="primary"
        title={
          <span>
            <i className="cil-cog mr-1 mt-1" />
            Opções
          </span>
        }
        className="options-button"
      >
        {/* <Link
          className="dropdown-item"
          to={{
            pathname: `/anuncios/editar/${advertId}`,
            state: { accountId: ad.account_id, advertId },
          }}
        >
          Editar
        </Link> */}
        <DiscountBtn advert={ad} />
        <RemoveDiscountBtn
          originalPrice={ad.original_price}
          tags={ad.external_data.tags || []}
          id={advertId}
        />
        <HeaderFooter advert={ad} />
        <ReplaceText advert={ad} />
        <AlterText advert={ad} />
        <AlterManufacturingTime advert={ad} />
        <FlexShipping advert={ad} />
        <CatalogCharts id={advertId} title={ad.title} categoryId={ad.category_id} url={ad.permalink} />
      </DropDown>
    </DropDownMenuStyles>
  );
}
